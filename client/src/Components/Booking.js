import {
  Button,
  Row,
  Col,
  Card,
  Container,
  Modal,
  Dropdown,
  Form,
  Tabs,
  Tab,
  ListGroup,
  Alert,
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import API from './../API';
import Basket from './Basket';
import ProductPage from './ProductPage';
import { useHistory } from 'react-router-dom';
import { clientOrders } from '../classes/ClientOrder';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useMediaQuery } from 'react-responsive';

var weekday = require('dayjs/plugin/weekday');
dayjs.extend(weekday);

dayjs.Ls.en.weekStart = 1;

function Booking(props) {
  const history = useHistory();

  const [productsBasket, setProductsBasket] = useState([]);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [currentProductDetails, setCurrentProductDetails] = useState();

  const [products, setProducts] = useState([]);
  const [productRows, setProductRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1224px)',
  });
  const isBigScreen = useMediaQuery({ query: '(min-width: 1225px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const isPortrait = useMediaQuery({ query: '(orientation: portrait)' });
  const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' });



  const [selectedUserID, setSelectedUserID] = useState(-1);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showChangeItemModal, setShowChangeItemModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemID, setNewItemID] = useState(-1);

  function getRightWeek(timepassed) {
    // the week number should be changed after the 23 o'clock of sunday. It becomes a new week since the customer can not order anymore in this week
    //Sunday from 23.00 until 23.59 consider this week orders

    if (dayjs(timepassed.date).day() === 0) {
      if (dayjs('01/01/2021 ' + timepassed.hour).hour() === 23) {
        const addWeekTime = dayjs(timepassed.date).add(1, 'week');
        //this week orders
        return {
          year: dayjs(addWeekTime).year(),
          week_number: dayjs(addWeekTime).week(),
        };
      }
    }
    console.log(dayjs(timepassed.date).week());
    return {
      year: dayjs(timepassed.date).year(),
      week_number: dayjs(timepassed.date).week(),
    };
  }

  /*USEFFECT products*/
  useEffect(() => {
    const getAllProducts = async () => {
      if (props.browsing) {
        const tmp_dy = {
          date: dayjs(props.time.date).add(1, 'week'),
          hour: props.time.hour,
        };
        let res = await API.getAllExpectedProducts(getRightWeek(tmp_dy).year, getRightWeek(tmp_dy).week_number)
        setProducts(res);
        if (props.orderChangeItem && props.orderChangeItemID !== -1) {
          const orderID = props.orders.find((o) => (o.id === props.orderChangeItemID)).order_id;
          const orderProducts = props.orders.filter((o) => (o.order_id === orderID)).map((o) => (o.product_id));
          res = res.filter((prod) => (!orderProducts.includes(prod.id)));
        }
        let rows = [
          ...Array(Math.ceil(res.filter((p) => p && p.active === 1).length / 3)),
        ];
        let productsRows = Array(rows.length);
        rows.forEach((row, idx) => {
          productsRows[idx] = res
            .filter((p) => p.active === 1)
            .slice(idx * 3, idx * 3 + 3);
        });
        setProductRows(productsRows);
      }
      else {
        let res = await API.getAllConfirmedProducts(getRightWeek(props.time).year, getRightWeek(props.time).week_number)
        setProducts(res);
        if (props.orderChangeItem && props.orderChangeItemID !== -1) {
          const orderID = props.orders.find((o) => (o.id === props.orderChangeItemID)).order_id;
          const orderProducts = props.orders.filter((o) => (o.order_id === orderID)).map((o) => (o.product_id));
          res = res.filter((prod) => (!orderProducts.includes(prod.id)));
        }
        let rows = [
          ...Array(Math.ceil(res.filter((p) => p && p.active === 1).length / 3)),
        ];
        let productsRows = Array(rows.length);
        rows.forEach((row, idx) => {
          productsRows[idx] = res
            .filter((p) => p.active === 1)
            .slice(idx * 3, idx * 3 + 3);
        });
        setProductRows(productsRows);
      }
    };
    getAllProducts();
  }, [props.time]);

  useEffect(() => {
    if (!props.orderChangeItem || props.orderChangeItemID === -1) {
      return;
    }

    const getAllProducts = async () => {
      let res = await API.getAllConfirmedProducts(getRightWeek(props.time).year, getRightWeek(props.time).week_number);
      setProducts(res);
      const orderID = props.orders.find((o) => (o.id === props.orderChangeItemID)).order_id;
      const orderProducts = props.orders.filter((o) => (o.order_id === orderID)).map((o) => (o.product_id));
      res = res.filter((prod) => (!orderProducts.includes(prod.id)));
      let rows = [
        ...Array(Math.ceil(res.filter((p) => p && p.active === 1).length / 3)),
      ];
      let productsRows = Array(rows.length);
      rows.forEach((row, idx) => {
        productsRows[idx] = res
          .filter((p) => p.active === 1)
          .slice(idx * 3, idx * 3 + 3);
      });
      setProductRows(productsRows);
    };
    getAllProducts();
  }, [props.orderChangeItemID]);

  /* Categories UseEffect */
  useEffect(() => {
    const getCategories = async () => {
      const c = [{ name: 'All', active: 1 }, ...(await API.getAllCategories())];
      setCategories(c);
    };
    getCategories();
  }, []);

  /* Product filtering by category */
  const filterProducts = (activeCategory) => {
    if (activeCategory === undefined || activeCategory === null) {
      activeCategory = categories.find((c) => c.active === 1).name;
    }

    setProducts((prods) => {
      const arr = prods.map((p) => {
        if (activeCategory === 'All' || p.category === activeCategory) {
          if (
            searchTerm === '' ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            p.active = 1;
            return p;
          }
        }
        p.active = 0;
        return p;
      });
      return arr;
    });
  };

  /* User selection */
  useEffect(() => {
    if (selectedUserID === -1) {
      setSelectedUser(null);
      return;
    }

    if (props.clients.find((c) => (c.client_id === parseInt(selectedUserID)))) {
      setSelectedUser(props.clients.find((c) => (c.client_id === parseInt(selectedUserID))));
    }
    else {
      setSelectedUserID(-1);
      setSelectedUser(null);
    }
  }, [selectedUserID])

  const addToCart = (product, qty) => {
    if (props.userRole === 'employee' && selectedUserID === -1) {
      return;
    }

    const clientID = props.userRole === 'employee' ? selectedUserID : props.clientid;

    if (product.quantity === 0) {
      return;
    }

    let prod = { ...product, buyQty: 0 };
    let cart = props.cartItems;
    if (!cart.has(clientID)) {
      cart.set(clientID, { items: [] });
    }
    let clientCart = cart.get(clientID).items;
    let cartItemIndex = clientCart.findIndex((item) => (item.id === product.id));
    if (cartItemIndex !== -1) {
      if (clientCart[cartItemIndex].buyQty + qty > product.quantity) {
        cart.get(clientID).items[cartItemIndex].buyQty = product.quantity;
      }
      else {
        cart.get(clientID).items[cartItemIndex].buyQty += qty;
      }
    }
    else {
      if (qty > product.quantity) {
        qty = product.quantity;
      }
      prod.buyQty = qty;
      cart.get(clientID).items.push(prod);
    }
    console.log(cart);
    props.setCartItems(cart);
    props.setCartUpdated(true);
  }

  function handleClick() {
    history.push('/registration');
  }

  function handleLogin() {
    history.push('/login');
  }


  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const listOfCardProducts = productRows.map((line, index) => {
    return (
      <Row key={index} className="d-flex justify-content-between">
        {line.map((productline) => {
          if (productline.active === 0) return;
          return (
            <Col key={productline.id}>
              <Card
                className="rounded-3 shadow-lg mb-5 mx-auto"
                style={{ width: '18rem', maxWidth: '18rem' }}
              >
                <Card.Img
                  variant="top"
                  src={
                    process.env.PUBLIC_URL +
                    'products/' +
                    productline.id +
                    '.jpg'
                  }
                />
                <Card.Body>
                  <div className="d-block">
                    <span className="fs-4 fw-bold">
                      {capitalizeFirstLetter(productline.name)}
                    </span>
                    <br />
                    <span className="fs-6 text-muted">
                      Producer: {productline.providerName}
                    </span>
                    <br />
                    <span className="fs-6 text-muted">Origin: Torino</span>
                  </div>
                  <hr className="my-1" />
                  <span className="d-block">
                    {productline.price} €/{productline.unit}{' '}
                  </span>
                  <small className="d-block text-muted mb-3">
                    {productline.quantity} {productline.unit} {props.browsing ? 'expected' : 'left in stock'}
                  </small>
                  {props.browsing && (
                    <Row>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentProductDetails(productline);
                          setShowProductDetailsModal(true);
                        }}
                      >
                        {detailsIcon} Product details
                      </Button>
                    </Row>
                  )}
                  {props.purchasing && props.userRole !== 'employee' && (
                    <Row>
                      <Button
                        variant="primary"
                        className="mb-1 align-middle"
                        onClick={() => {
                          addToCart(productline, 0.5);
                        }}
                      >
                        {cartIcon} Add to Cart
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentProductDetails(productline);
                          setShowProductDetailsModal(true);
                        }}
                      >
                        {detailsIcon} Product details
                      </Button>
                    </Row>
                  )}
                  {props.purchasing && props.userRole === 'employee' && (
                    <Row>
                      <Button
                        variant="primary"
                        className="mb-1 align-middle"
                        disabled={selectedUserID === -1}
                        onClick={() => {
                          addToCart(productline, 0.5);
                        }}
                      >
                        {cartIcon} Add to client Cart
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentProductDetails(productline);
                          setShowProductDetailsModal(true);
                        }}
                      >
                        {detailsIcon} Product details
                      </Button>
                    </Row>
                  )}
                  {props.orderChangeItem && (
                    <Row>
                      <Button
                        variant="primary"
                        className="mb-1 align-middle"
                        onClick={() => {
                          setNewItemID(productline.id);
                          setShowChangeItemModal(true);
                        }}
                      >
                        {cartIcon} Swap with this product
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentProductDetails(productline);
                          setShowProductDetailsModal(true);
                        }}
                      >
                        {detailsIcon} Product details
                      </Button>
                    </Row>
                  )}
                  {props.orderAddItem && (
                    <Row>
                      <Button
                        variant="primary"
                        className="mb-1 align-middle"
                        onClick={() => {
                          setNewItemID(productline.id);
                          setShowAddItemModal(true);
                        }}
                      >
                        {cartIcon} Add this product
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentProductDetails(productline);
                          setShowProductDetailsModal(true);
                        }}
                      >
                        {detailsIcon} Product details
                      </Button>
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  });

  function YouAreNotLoggedScreen() {
    return (
      <>
        <Row>
          <Col className="text-center">
            <span className="d-block text-center mt-5 mb-3 display-2">
              Do not have an account yet?
            </span>
            <Button className="m1 align-middle" size="lg" onClick={handleClick}>
              Sign up
            </Button>
            <Button
              className="m-1 align-middle"
              size="lg"
              onClick={handleLogin}
            >
              Login
            </Button>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <Container fluid className=" w-100-custom">
        <span className="d-block text-center mt-5 mb-2 display-2">
          Product Booking
        </span>
        {props.browsing ? (
          <h5 className="d-block mx-auto mb-5 text-center text-muted">
            These are the products planned for the next week. They are not yet
            purchasable
          </h5>
        ) : (
          <>
            <h5 className="d-block mx-auto mb-5 text-center text-muted">
              Choose below the products you want to book for the client
            </h5>
          </>
        )}
        {props.userRole === 'employee' && (
          <div className="row">
            <div className='col-lg-4'></div>
            <div className='col-lg-4'>
              <div className="d-block text-center">
                <h3 className="text-muted">Ordering for</h3>
              </div>
              <Form.Select size="lg" className="mb-3 mx-2" value={selectedUserID} onChange={(event) => setSelectedUserID(event.target.value)}>
                <option value={-1}>No client selected</option>
                {props.clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    • {c.name} {c.surname} ({c.email})
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className='col-lg-4'></div>
          </div>
        )}

        {props.logged ? (
          <Row className="m-1">

            <Col lg={3} className="my-5 text-center vertical-separator-products">
              <ul className="list-group list-group-vertical mx-5">
                <div className='list-group-item bg-light'>
                  <h3>Filter by category</h3>
                  <h6 className='text-muted'>Click one of the categories below to apply the filter</h6>
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={
                      cat.active
                        ? 'list-group-item list-group-item-action active'
                        : 'list-group-item list-group-item-action'
                    }
                    onClick={() => {
                      setCategories((cats) =>
                        cats.map((c) => {
                          if (c.name === cat.name) {
                            return { name: c.name, active: 1 };
                          }
                          return { name: c.name, active: 0 };
                        })
                      );
                      filterProducts(cat.name);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </ul>
            </Col>
            <Col
              lg={9}
              className="my-5 text-center"
            >
              <div className="d-block mx-5 my-3">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-9 text-center">
                      {isTabletOrMobile && <h4>Search for products</h4>}
                      <input
                        className="form-control mb-2"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Type desired product here"
                      />
                    </div>
                    <div className="col-lg-3 text-center px-3 mb-3">
                      <button
                        className="btn btn-primary w-100 "
                        onClick={() => filterProducts()}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {products.filter((p) => p && p.active === 1).length > 0 ? (
                listOfCardProducts
              ) : (
                <div className="d-block text-center">
                  Oops! There are no products in this category.
                </div>
              )}
            </Col>

          </Row>
        ) : (
          <YouAreNotLoggedScreen />
        )}
      </Container>

      <Modal
        size="lg"
        show={showProductDetailsModal}
        onHide={() => setShowProductDetailsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {capitalizeFirstLetter(
              currentProductDetails ? currentProductDetails.name : ''
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductPage
            browsing={props.browsing}
            onAdd={addToCart}
            setShowProductDetailsModal={setShowProductDetailsModal}
            prod={currentProductDetails}
            operationType="booking"
          ></ProductPage>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowProductDetailsModal(false)}
          >
            Back to the products
          </button>
        </Modal.Footer>
      </Modal>

      <ItemChangeModal show={showChangeItemModal} setShow={setShowChangeItemModal} oldID={props.orderChangeItemID} newID={newItemID} products={products} orders={props.orders} clients={props.clients} clientid={props.clientid} />

      <Modal show={showAddItemModal} onHide={() => (setShowAddItemModal(false))}>
        <Modal.Header closeButton>
          <Modal.Title>
            Order modification<br />
            <h4 className='lead text-muted'>Adding a new item</h4>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Modal body text goes here.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary">Close</Button>
          <Button variant="primary">Add item</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function ItemChangeModal(props) {

  const [oldItem, setOldItem] = useState(null);
  const [newItem, setNewItem] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(0.5);

  useEffect(() => {
    if (props.newID !== -1) {
      setNewItem({ ...props.products.find((p) => (p.id === props.newID)), buyQty: 0.5 });
    }
    if (props.oldID !== -1) {
      const oldOrderEntry = props.orders.find((o) => (o.id === props.oldID));
      if (props.products.find((p) => (p.id === oldOrderEntry.product_id))) {
        setOldItem({ ...props.products.find((p) => (p.id === oldOrderEntry.product_id)), buyQty: oldOrderEntry.order_quantity });
      }
      else {
        setOldItem(null);
      }
    }
  }, [props.newID, props.oldID]);

  const capitalizeEachFirstLetter = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(' ');
  };

  const incrementQuantity = (qty) => {
    let item = newItem;
    if (item.buyQty + qty > item.quantity) {
      return;
    }
    item.buyQty += qty;
    setNewItem(item);
    setBuyQuantity(item.buyQty);
  }

  const decrementQuantity = (qty) => {
    let item = newItem;
    if (item.buyQty - qty > 0) {
      item.buyQty -= qty;
      setNewItem(item);
      setBuyQuantity(item.buyQty);
    }
    return;
  }

  return (
    <Modal size="lg" show={props.show} onHide={() => (props.setShow(false))}>
      <Modal.Header closeButton>
        <Modal.Title>
          Order modification<br />
          <h4 className='lead text-muted'>Swapping items</h4>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {oldItem && (
          <div className="list-group-item shadow bg-light">
            <div className='d-block text-center'>
              <h4 className='d-inline-block text-muted me-3'>Available wallet balance</h4>
              <h1 className='d-inline-block'>{props.clients.find((c) => (c.client_id === props.clientid)).budget + oldItem.buyQty * oldItem.price}€</h1>
            </div>
          </div>
        )}
        {oldItem && (
          <div className="list-group-item shadow">
            <div className="row">
              <div className="col-md-2 mb-2 my-auto align-middle">
                <img
                  className="w-100 shadow rounded-circle"
                  src={
                    process.env.PUBLIC_URL +
                    'products/' +
                    oldItem.id +
                    '.jpg'
                  }
                  alt="Product img"
                />
              </div>
              <div className="col-md-6 mb-2 text-start mt-2">
                <div className='d-block'>
                  <h4>{capitalizeEachFirstLetter(oldItem.name)}</h4>
                </div>
                <div className='d-block'>
                  {stockIcon} {oldItem.buyQty} {oldItem.unit} purchased
                </div>
                <div className='d-block'>
                  {priceIcon} {oldItem.price}€ / {oldItem.unit}
                </div>
              </div>
              <div className="col-md-4 mb-2 my-auto align-middle">
                <div className="d-block w-100">
                  <div className='d-inline-block my-1 px-1 w-25'>
                    <Button variant="secondary" className="w-100" disabled={true}>-</Button>
                  </div>
                  <div className='d-inline-block my-1 px-1 w-50'>
                    <Form.Control type="text" className="w-100 text-center" value={oldItem.buyQty + " " + oldItem.unit} onChange={() => { return; }} />
                  </div>
                  <div className='d-inline-block my-1 px-1 w-25'>
                    <Button variant="primary" className="w-100" disabled={true}>+</Button>
                  </div>
                </div>
                <div className='d-block w-100 px-1'>
                  <Form.Control type="text" className="w-100 text-center" value={"Old item price: " + (oldItem.buyQty * oldItem.price).toFixed(2) + "€"} onChange={() => { return; }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className='d-block text-center'>
          {arrowDown}
        </div>
        {newItem && (
          <div className="list-group-item shadow">
            <div className="row">
              <div className="col-md-2 mb-2 my-auto align-middle">
                <img
                  className="w-100 shadow rounded-circle"
                  src={
                    process.env.PUBLIC_URL +
                    'products/' +
                    newItem.id +
                    '.jpg'
                  }
                  alt="Product img"
                />
              </div>
              <div className="col-md-6 mb-2 text-start mt-2">
                <div className='d-block'>
                  <h4>{capitalizeEachFirstLetter(newItem.name)}</h4>
                </div>
                <div className='d-block'>
                  {stockIcon} {newItem.quantity} {newItem.unit} available
                </div>
                <div className='d-block'>
                  {priceIcon} {newItem.price}€ / {newItem.unit}
                </div>
              </div>
              <div className="col-md-4 mb-2 my-auto align-middle">
                <div className="d-block w-100">
                  <div className='d-inline-block my-1 px-1 w-25'>
                    <Button variant="secondary" className="w-100" onClick={() => (decrementQuantity(0.5))}>-</Button>
                  </div>
                  <div className='d-inline-block my-1 px-1 w-50'>
                    <Form.Control type="text" className="w-100 text-center" value={buyQuantity + " " + newItem.unit} onChange={() => { return; }} />
                  </div>
                  <div className='d-inline-block my-1 px-1 w-25'>
                    <Button variant="primary" className="w-100" onClick={() => (incrementQuantity(0.5))}>+</Button>
                  </div>
                </div>
                <div className='d-block w-100 px-1'>
                  <Form.Control type="text" className="w-100 text-center fw-bold" value={"New item price: " + (buyQuantity * newItem.price).toFixed(2) + "€"} onChange={() => { return; }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {oldItem && newItem && buyQuantity * newItem.price > props.clients.find((c) => (c.client_id === props.clientid)).budget + oldItem.buyQty * oldItem.price && (
          <Alert variant="danger" className="mt-4">
            <div className='d-block text-center'>
              <h3 className='lead'>{dangerIcon} New item price cannot be greater than the available budget</h3>
            </div>
          </Alert>
        )}

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => (props.setShow(false))}>Close</Button>
        <Button variant="primary">Confirm swap</Button>
      </Modal.Footer>
    </Modal>
  );
}

const cartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    className="bi bi-cart-plus"
    viewBox="0 0 16 16"
  >
    <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z" />
    <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>
);

const detailsIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    className="bi bi-info-circle"
    viewBox="0 0 16 16"
  >
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
  </svg>
);

const stockIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="currentColor"
    className="bi bi-boxes"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434L7.752.066ZM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567L4.25 7.504ZM7.5 9.933l-2.75 1.571v3.134l2.75-1.571V9.933Zm1 3.134 2.75 1.571v-3.134L8.5 9.933v3.134Zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567-2.742 1.567Zm2.242-2.433V3.504L8.5 5.076V8.21l2.75-1.572ZM7.5 8.21V5.076L4.75 3.504v3.134L7.5 8.21ZM5.258 2.643 8 4.21l2.742-1.567L8 1.076 5.258 2.643ZM15 9.933l-2.75 1.571v3.134L15 13.067V9.933ZM3.75 14.638v-3.134L1 9.933v3.134l2.75 1.571Z"
    />
  </svg>
);

const priceIcon = (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
  <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
  <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
</svg>)

const arrowDown = <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
</svg>

const dangerIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
  <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
  <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
</svg>

export default Booking;
