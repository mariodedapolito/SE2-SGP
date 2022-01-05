import { Button, Row, Col, Table, Image, Modal, Badge } from 'react-bootstrap';
import { useState, useEffect } from "react";
import p from './circle-fill.svg';
import d from './iconDelete.svg';
import im from './pencil-fill.svg';
import API from '../API'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function Orders(props) {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [id, setId] = useState();
  const [farmerShipped, setFarmerShipped] = useState(false);

  let m = props.orders.filter(x => x.client_id === props.clientid).map(s => s.order_id).filter(onlyUnique);
  m.reverse();

  const handleModifyOrder = (farmer_shipped, order_id) => {
    if (farmer_shipped) {
      return;
    }
    setShow(true);
    setId(order_id);
  }

  return (
    <>
      <div className="container-fluid">

        <span className="d-block text-center mt-5 mb-2 display-1">
          My Orders
        </span>
        <h5 className="d-block mx-auto mb-5 text-center text-muted">
          Below you can find all the orders you have placed. You can also modify an order if it has not yet been shipped by the farmer.
        </h5>

        <div className="row mx-3">
          <Table striped bordered hover variant="light" responsive="lg" size="lg" className='px-5'>
            <thead >
              <tr>
                <th>Order id</th>
                <th>Products</th>
                <th>Total</th>
                <th>Payment status</th>
                <th>Purchase Type</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.orders.filter(x => x.client_id === props.clientid).map((s) => {
                if (m.find(x => (parseInt(x) === parseInt(s.order_id)))) {

                  const order_id = s.order_id;
                  let pendingFlag = false;
                  let farmerShippedFlag = false;
                  props.orders.filter((o) => (o.order_id === order_id)).forEach(o => {
                    if (o.state === "pending") {
                      pendingFlag = true;
                    }
                    if (o.farmer_state !== null) {
                      farmerShippedFlag = true;
                    }
                  });

                  let id1 = m[m.length - 1];
                  let array = props.orders.filter(x => x.order_id === id1).map(x => x.OrderPrice);
                  let sum = 0;

                  for (const a of array) { sum = sum + a; }
                  sum = sum.toFixed(2);
                  m.pop();

                  return (
                    <tr key={s.id}>
                      <td className='align-middle'> {s.order_id}</td>
                      <td className='align-middle'>
                        <Button variant="link" onClick={() => { setShow(true); setId(s.order_id); setFarmerShipped(farmerShippedFlag); }}>Show ordered products</Button>
                      </td>
                      <td className='align-middle'>{sum}€</td>
                      {pendingFlag && <td className='align-middle text-danger'>Pending (contact shop)</td>}
                      {!pendingFlag && <td className='align-middle'>Payment successfull</td>}
                      <td className='align-middle'>{s.pickup === 0 ? 'Home delivery' : 'Pick up'}</td>
                      <td className='align-middle'>{dayjs(s.date + ' ' + s.time).format("ddd, MMM D, YYYY HH:mm")}</td>
                      <td>
                        <Button variant="success" className="d-block my-1 mx-2 w-100" onClick={() => { setShow2(true); setId(s.order_id); }}>
                          Track order status
                        </Button>
                        <button
                          className="btn btn-secondary d-block my-1 mx-2 w-100"
                          disabled={farmerShippedFlag}
                          onClick={() => { handleModifyOrder(farmerShippedFlag, s.order_id) }}
                        >
                          Modify order
                        </button>
                      </td>
                    </tr>
                  );
                }
              })
              }
            </tbody>
          </Table>
          {props.orders.filter(x => x.client_id === props.clientid).length === 0 &&
            <div className='d-block text-center my-3'>
              You have not placed any orders yet. Start by placing <Link to="/booking">an order</Link>.
            </div>
          }
        </div >
      </div>

      <ProductList show={show} setShow={setShow} farmerShipped={farmerShipped} orders={props.orders} products={props.products} id={id} />
      <OrderStatus show={show2} setShow={setShow2} orders={props.orders} products={props.products} id={id} />

      {/* <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title >
            <Row>
              <Col xs={4} md={4} style={{ 'fontSize': 24 }}>Product</Col>
              <Col xs={2} md={2} style={{ 'fontSize': 24 }}>Kilos</Col>
              <Col xs={2} md={2} style={{ 'fontSize': 24 }}>Price</Col>
              <Col xs={2} md={2} style={{ 'fontSize': 24 }}>Edit</Col>
              <Col xs={2} md={2} style={{ 'fontSize': 24 }}>Delete</Col>
            </Row>
          </Modal.Title>
        </Modal.Header>

        {props.orders.filter(x => (x.state === "booked") && (x.order_id === id) && (x.client_id === parseInt(props.clientid))).map((s) =>
          <Modal.Body key={s.id}>
            <Row>
              <Col xs={4} md={4}><Image src={p} style={{ width: '5px', height: '5px' }}></Image>{' '}{s.product_name.toUpperCase()}
              </Col>
              <Col xs={1} md={1} style={{ 'fontSize': 20 }}> {s.order_quantity}</Col>
              <Col xs={2} md={2} style={{ 'fontSize': 20 }}>{' '} {s.OrderPrice}€</Col>
              <Col xs={2} md={2}> <Link to={{ pathname: "/booking", state: { item: s, status: 'update' } }}><Image src={im} style={{ 'cursor': 'pointer', width: '20px', height: '20px' }}></Image></Link></Col>
              <Col xs={2} md={2}> <Image src={d} style={{ 'cursor': 'pointer', width: '20px', height: '20px' }} onClick={() => {

                API.deleteOrderItem(s.id).then(() => { props.setRecharged(true); });

              }}></Image></Col></Row>
          </Modal.Body>)}
        <Modal.Footer>
          <Link to={{ pathname: "/booking", state: { item: order, status: 'add' } }}>
            <Button variant={"primary"}>Add new products</Button></Link>

          <Button variant={"secondary"} onClick={() => { setShow(false); }}>Close</Button>


        </Modal.Footer>
      </Modal> */}

      {/*modal number 2*/}
      {/* <Modal show={show2} onHide={handleClose2} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title >
            <Row>
              <Col xs={3} md={3}>Product</Col>
              <Col xs={3} md={3}>{' '}</Col>
              <Col xs={2} md={2}>Kilos</Col>
              <Col xs={1} md={1}>{' '}</Col>
              <Col xs={2} md={2}>Price</Col>

            </Row>
          </Modal.Title>
        </Modal.Header>

        {props.orders.filter(x => (x.order_id === id) && (x.client_id === parseInt(props.clientid))).map((s) =>
          <Modal.Body key={s.id}>
            <Row>
              <Col xs={4} md={4}><Image src={p} style={{ width: '5px', height: '5px' }}></Image>{' '}{s.product_name.toUpperCase()}
              </Col>
              <Col xs={2} md={2} style={{ 'fontSize': 20 }}> {s.order_quantity}</Col>
              <Col xs={4} md={4} style={{ 'fontSize': 20 }}>{' '} {s.OrderPrice}€</Col>
            </Row>
          </Modal.Body>)}

      </Modal> */}
    </>
  );
}

function ProductList(props) {

  const capitalizeEachFirstLetter = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(' ');
  };

  return (
    <Modal show={props.show} onHide={() => (props.setShow(false))} size="lg">
      <Modal.Header closeButton>
        <Modal.Title >
          Products in order #{props.id}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ul className="list-group">
          {props.orders.filter((o) => (o.order_id === props.id)).map((s) => (
            <li key={s.product_id} className="list-group-item">
              <div className="row">
                <div className="col-md-2 mb-2 my-auto align-middle">
                  <img
                    className="w-100 shadow rounded-circle"
                    src={
                      process.env.PUBLIC_URL +
                      'products/' +
                      s.product_id +
                      '.jpg'
                    }
                    alt="Product img"
                  />
                </div>
                <div className="col-md-6 mb-2 text-start my-auto">
                  <div className='d-block'>
                    <h4>{capitalizeEachFirstLetter(s.product_name)}</h4>
                  </div>
                  <div className='d-block'>
                    {stockIcon} {s.order_quantity} {props.products.find((p) => (p.id === s.product_id)).unit}
                  </div>
                  <div className='d-block'>
                    {priceIcon} {s.OrderPrice}€
                  </div>
                </div>
                <div className="col-md-4 mb-2 my-auto">
                  <Button variant="primary" className="d-block my-1 mx-2 w-100" disabled={props.farmerShipped}>
                    Change product
                  </Button>
                  <Button variant="secondary" className="d-block my-1 mx-2 w-100" disabled={props.farmerShipped}>
                    Remove product
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => (props.setShow(false))}>Close product list</Button>
      </Modal.Footer>
    </Modal>);
}

function OrderStatus(props) {

  const [status, setStatus] = useState(null);

  useEffect(() => {
    let min = 1000;
    let orderStatus = null;

    console.log(props.orders.filter((o) => (o.order_id === props.id)));

    props.orders.filter((o) => (o.order_id === props.id)).forEach((item) => {

      const type = item.pickup === 0 ? 'delivery' : 'pick-up';
      let orderStatusLocal = null;

      if (item.state === 'pending') {
        orderStatusLocal = getOrderStatus('pending', type);
      }
      else if (item.state === 'booked' && item.farmer_state === null) {
        orderStatusLocal = getOrderStatus('booked', type);
      }
      else if (item.state === 'booked' && item.farmer_state === 'farmer-shipped') {
        orderStatusLocal = getOrderStatus('farmer-shipped', type);
      }
      else if (item.state === 'received') {
        orderStatusLocal = getOrderStatus('received', type);
      }
      else if (item.state === 'prepared') {
        orderStatusLocal = getOrderStatus('prepared', type);
      }
      else if (item.state === 'shipped') {
        orderStatusLocal = getOrderStatus('shipped', type);
      }
      else if (item.state === 'delivered') {
        orderStatusLocal = getOrderStatus('delivered', type);
      }

      if (orderStatusLocal.num_steps < min) {
        orderStatus = orderStatusLocal;
        min = orderStatusLocal.num_steps;
      }
    });

    setStatus(orderStatus);
  }, [props.id]);

  const getOrderStatus = (status, type) => {
    const orderStatus = {
      order_completed: false,
      order_steps: 0,
      delivery_type: '',
      client: { payed: false }, farmer: { shipped: false },
      warehouse: { received: false, prepared: false },
      delivery: { picked_up: false, shipped: false, delivered: false }
    };

    orderStatus.delivery_type = type;

    if (status === 'pending') {
      orderStatus.client.payed = false;
      orderStatus.num_steps = 0;
    }
    else if (status === 'booked') {
      orderStatus.client.payed = true;
      orderStatus.num_steps = 1;
    }
    else if (status === 'farmer-shipped') {
      orderStatus.client.payed = true;
      orderStatus.farmer.shipped = true;
      orderStatus.num_steps = 2;
    }
    else if (status === 'received') {
      orderStatus.client.payed = true;
      orderStatus.farmer.shipped = true;
      orderStatus.warehouse.received = true;
      orderStatus.num_steps = 3;
    }
    else if (status === 'prepared') {
      orderStatus.client.payed = true;
      orderStatus.farmer.shipped = true;
      orderStatus.warehouse.received = true;
      orderStatus.warehouse.prepared = true;
      orderStatus.num_steps = 4;
    }
    else if (type === 'pick-up') {
      if (status === 'delivered') {
        orderStatus.client.payed = true;
        orderStatus.farmer.shipped = true;
        orderStatus.warehouse.received = true;
        orderStatus.warehouse.prepared = true;
        orderStatus.delivery.picked_up = true;
        orderStatus.order_completed = true;
        orderStatus.num_steps = 5;
      }
    }
    else if (type === 'delivery') {
      if (status === 'shipped') {
        orderStatus.client.payed = true;
        orderStatus.farmer.shipped = true;
        orderStatus.warehouse.received = true;
        orderStatus.warehouse.prepared = true;
        orderStatus.delivery.shipped = true;
        orderStatus.num_steps = 5;
      }
      else if (status === 'delivered') {
        orderStatus.client.payed = true;
        orderStatus.farmer.shipped = true;
        orderStatus.warehouse.received = true;
        orderStatus.warehouse.prepared = true;
        orderStatus.delivery.shipped = true;
        orderStatus.delivery.delivered = true;
        orderStatus.order_completed = true;
        orderStatus.num_steps = 6;
      }
    }
    else {
      console.error("INVALID ORDER STATUS " + status + " " + type);
    }

    return orderStatus;
  }


  return (
    <Modal show={props.show} onHide={() => (props.setShow(false))} size="lg">
      <Modal.Header closeButton>
        <Modal.Title >

        </Modal.Title>
      </Modal.Header>

      {status &&
        <Modal.Body>
          <div className="row">
            <div className="col-lg-6 display-6">Order history {props.id}</div>
            <div className="col-lg-6">
              <h5 className='d-block mt-2 mb-0 me-2 text-end'>
                <Badge bg={status.order_completed ? "success" : "danger"}>{status.order_completed ? "Order completed" : "Order not yet completed"}</Badge>
              </h5>
            </div>
          </div>

          <div className='row'>
            <span className='d-block lead mt-2'><span className='text-success'>{verticalIcon}</span> Client</span>
            <div className="d-block text-success fw-bold">{completedIcon} Order placed</div>
            {status.client.payed && <span className='d-block text-success'>{verticalIcon}</span>}
            {!status.client.payed && <span className='d-block text-secondary'>{verticalIcon}</span>}
            {status.client.payed && <div className="d-block text-success fw-bold">{completedIcon} Payment completed</div>}
            {!status.client.payed && <div className="d-block text-danger fw-bold">{errorIcon} Payment pending</div>}
          </div>
          <div className='row'>
            {status.client.payed && status.farmer.shipped && <span className='d-block lead mt-2'><span className='text-success'>{verticalIcon}</span> Farmer</span>}
            {(!status.client.payed || !status.farmer.shipped) && <span className='d-block lead mt-2'><span className='text-secondary'>{verticalIcon}</span> Farmer</span>}
            {status.farmer.shipped && <div className="d-block text-success fw-bold">{completedIcon} All farmers have shipped the products</div>}
            {!status.farmer.shipped && <div className="d-block text-secondary">{incompletedIcon} All farmers have shipped the products</div>}
          </div>
          <div className='row'>
            {status.farmer.shipped && status.warehouse.received && <span className='d-block lead mt-2'><span className='text-success'>{verticalIcon}</span> Warehouse</span>}
            {(!status.farmer.shipped || !status.warehouse.received) && <span className='d-block lead mt-2'><span className='text-secondary'>{verticalIcon}</span> Warehouse</span>}

            {status.warehouse.received && <div className="d-block text-success fw-bold">{completedIcon} Farmer shipment has been received by the warehouse</div>}
            {!status.warehouse.received && <div className="d-block text-secondary">{incompletedIcon} Farmer shipment has been received by the warehouse</div>}

            {status.warehouse.received && status.warehouse.prepared && <span className='d-block text-success'>{verticalIcon}</span>}
            {(!status.warehouse.received || !status.warehouse.prepared) && <span className='d-block text-secondary'>{verticalIcon}</span>}

            {status.warehouse.prepared && <div className="d-block text-success fw-bold">{completedIcon} Order has been prepared by the warehouse</div>}
            {!status.warehouse.prepared && <div className="d-block text-secondary">{incompletedIcon} Order has been prepared by the warehouse</div>}
          </div>
          <div className='row'>
            {status.warehouse.prepared && status.delivery_type === 'pick-up' && status.delivery.delivered && <span className='d-block lead mt-2'><span className='text-success'>{verticalIcon}</span> Delivery</span>}
            {status.delivery_type === 'pick-up' && (!status.warehouse.prepared || !status.delivery.delivered) && <span className='d-block lead mt-2'><span className='text-secondary'>{verticalIcon}</span> Delivery</span>}

            {status.delivery_type === 'pick-up' && status.delivery.delivered && <div className="d-block text-success fw-bold">{completedIcon} Client has picked up the order</div>}
            {status.delivery_type === 'pick-up' && !status.delivery.delivered && <div className="d-block text-secondary">{incompletedIcon} Client has picked up the order</div>}


            {status.warehouse.prepared && status.delivery_type === 'delivery' && status.delivery.shipped && <span className='d-block lead mt-2'><span className='text-success'>{verticalIcon}</span> Delivery</span>}
            {(status.delivery_type === 'delivery' && (!status.warehouse.prepared || !status.delivery.shipped)) && <span className='d-block lead mt-2'><span className='text-secondary'>{verticalIcon}</span> Delivery</span>}

            {status.delivery_type === 'delivery' && status.delivery.shipped && <div className="d-block text-success fw-bold">{completedIcon} Order has been shipped</div>}
            {status.delivery_type === 'delivery' && !status.delivery.shipped && <div className="d-block text-secondary">{incompletedIcon} Order has been shipped</div>}

            {status.delivery_type === 'delivery' && status.delivery.shipped && status.delivery.delivered && <span className='d-block text-success'>{verticalIcon}</span>}
            {status.delivery_type === 'delivery' && (!status.delivery.shipped || !status.delivery.delivered) && <span className='d-block text-secondary'>{verticalIcon}</span>}

            {status.delivery_type === 'delivery' && status.delivery.delivered && <div className="d-block text-success fw-bold">{completedIcon} Order successfully delivered</div>}
            {status.delivery_type === 'delivery' && !status.delivery.delivered && <div className="d-block text-secondary">{incompletedIcon} Order successfully delivered</div>}
          </div>
        </Modal.Body>
      }
      <Modal.Footer>
        <Button onClick={() => (props.setShow(false))}>Close order history</Button>
      </Modal.Footer>
    </Modal >
  );
}

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

const incompletedIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
</svg>

const priceIcon = (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
  <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
  <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
</svg>)

const completedIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
</svg>

const errorIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
</svg>

const verticalIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
</svg>

export default Orders;
