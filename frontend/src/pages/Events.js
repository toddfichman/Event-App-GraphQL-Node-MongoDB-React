import React, { Component } from "react";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from '../context/auth-context';

import "./Events.css";

export default class EventsPage extends Component {
  state = {
    creating: false,
    events: []
  };

  //using context to access token
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElementRef = React.createRef();
    this.priceElementRef = React.createRef();
    this.dateElementRef = React.createRef();
    this.descriptionElementRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }


  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElementRef.current.value;
    const price = +this.priceElementRef.current.value;
    const date = this.dateElementRef.current.value;
    const description = this.descriptionElementRef.current.value;

    if (title.trim().length === 0 || price <=  0 || date.trim().length === 0 || description.trim().length === 0) {
      return;
    }

    const event = {
      title: title, 
      price: price, 
      date: date, 
      description: description
    };

    console.log(event);

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };
    
    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody), 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        console.log(res)
        throw new Error('Failed');
      }
      return res.json();
    })
    .then(resData => {
      //fetching events here so list updates when new event created
      this.fetchEvents();
    })
    .catch(err => {
      console.log(err)
    }) 
  };

  modalCancelHandler = () => {
    this.setState({ creating: false });
  };

  fetchEvents = () => {
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody), 
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        console.log(res)
        throw new Error('Failed');
      }
      return res.json();
    })
    .then(resData => {
      const events = resData.data.events;
      this.setState({events : events});
    })
    .catch(err => {
      console.log(err);
    }) 
  };
  

  render() {
    const eventList = this.state.events.map(event => {
      return <li key={event._id} className="events__list-item">{event.title}</li>
    })
    return (
      <React.Fragment>
        {this.state.creating && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElementRef}/>
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" ref={this.priceElementRef}/>
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateElementRef}/>
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows="4" ref={this.descriptionElementRef}/>
              </div>
            </form>
          </Modal>
        )}
        {this.context.token && (
        <div className="events-control">
          <p>Share Your Own Events! </p>
          <button className="btn" onClick={this.startCreateEventHandler}>
            Create Event
          </button>
        </div>
        )}
        
        <ul className="events__list">
          {eventList}
        </ul>
      </React.Fragment>
    );
  }
}
