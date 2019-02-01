import React, { Component } from "react";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import EventsList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';

import "./Events.css";

export default class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
  };

  isActive = true;

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
      //updated events w/ new one and adding new one to list of existing events
      this.setState(prevState => {
        const updatedEvents = [...prevState.events];
        updatedEvents.push({ //pushing newly created event to events list instantly 
          _id: resData.data._id,
          title: resData.data.title,
          description: resData.data.description,
          price: resData.data.price,
          date: resData.data.date,
          creator: {
            _id: this.context.userId,
          }})
          return {events: updatedEvents};
      });
    })
    .catch(err => {
      console.log(err)
    }) 
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fetchEvents = () => {
    this.setState({isLoading: true});
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
      if (this.isActive) {
        this.setState({ events : events, isLoading: false });
      }
    })
    .catch(err => {
      console.log(err);
      if (this.isActive) {
        this.setState({ isLoading: false });
      }
    }) 
  };
  
  showDetailHandler = eventId => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };


  bookEventHandler = () => {
    if(!this.context.token){
      this.setState({selectedEvent: null})
      return;
    }

    const requestBody = {
      query: `
        mutation {
          bookEvent(eventId: "${this.state.selectedEvent._id}") {
            _id
            createdAt
            updatedAt
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody), 
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token
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
      console.log(resData);
      this.setState({selectedEvent: null})
      
    })
    .catch(err => {
      console.log(err);
      this.setState({ isLoading: false });
    }) 
  }

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    

    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText='Confirm'
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

        {this.state.selectedEvent && (
          <Modal
          title={this.state.selectedEvent.title}
          canCancel
          canConfirm
          onCancel={this.modalCancelHandler}
          onConfirm={this.bookEventHandler}
          confirmText={this.context.token ? 'Book' : 'Confirm'}
          >
            <h2>
              ${this.state.selectedEvent.price} -{' '}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
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
        
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventsList 
            events={this.state.events} 
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
       
      </React.Fragment>
    );
  }
}
