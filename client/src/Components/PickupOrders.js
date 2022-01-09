import { Button, Row, Col, Table, Image, Modal } from 'react-bootstrap';
import { useState } from 'react';
import p from './circle-fill.svg';
import d from './iconDelete.svg';
import im from './pencil-fill.svg';
import API from '../API';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function PickupOrders(props) {
  const [id, setId] = useState();

  let m = props.orders
    .filter(
      (x) =>
        dayjs(x.date + ' ' + x.time).isBefore(dayjs()) &&
        x.state !== 'pending' &&
        x.pickup === 1
    )
    .map((s) => s.order_id)
    .filter(onlyUnique);

  m.reverse();

  return (
    <>
      <span className="d-block text-center mt-2 mb-1 display-1">
        List of Missed Pickups
      </span>

      <table className="mx-3 text-center table table-striped table-hover table-responsive">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Client</th>
            <th>Total</th>
            <th>Date & Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.orders
            .filter(
              (x) =>
                dayjs(x.date + ' ' + x.time).isBefore(dayjs()) &&
                x.state !== 'pending' &&
                x.pickup === 1
            )
            .map((s) => {
              if (!m.find((x) => parseInt(x) === parseInt(s.order_id))) {
                return <td key={s.id} style={{ display: 'none' }}></td>;
              } else {
                let id1 = m[m.length - 1];
                let array = props.orders
                  .filter((x) => x.order_id === id1)
                  .map((x) => x.OrderPrice);
                let sum = 0;
                for (const a of array) {
                  sum = sum + a;
                }

                sum = sum;
                m.pop();

                return (
                  <tr key={s.id}>
                    <td className="align-middle">{s.order_id}</td>
                    <td className="align-middle">
                      {props.clients.find((c) => c.client_id === s.client_id)
                        ? props.clients.find((c) => c.client_id === s.client_id)
                            .name +
                          ' ' +
                          props.clients.find((c) => c.client_id === s.client_id)
                            .surname
                        : 'Unknown'}
                    </td>
                    <td className="align-middle">{sum}€</td>
                    <td className="align-middle">
                      {dayjs(s.date + ' ' + s.time).format(
                        'ddd, MMM D, YYYY HH:mm'
                      )}
                    </td>
                    <td className="align-middle">
                      {!props.missed.find((x) => x.order_id === s.order_id) ? (
                        <Button
                          className="btn btn-primary"
                          onClick={() => {
                            const newMissed = Object.assign(
                              {},
                              {
                                order_id: s.order_id,
                                client_id: s.client_id,
                              }
                            );
                            console.log(newMissed);
                            API.addMissedPickup(newMissed).then(() => {
                              API.updateState(s.order_id, 'missed');
                              props.setRecharged2(true);
                              props.setRecharged(true);
                            });
                          }}
                        >
                          mark the pickup as missed
                        </Button>
                      ) : (
                        <>
                          <Button variant="danger" disabled>
                            missed pickup
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              }
            })}
        </tbody>
      </table>
    </>
  );
}
export default PickupOrders;
