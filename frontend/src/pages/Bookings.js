import React, { Component } from 'react';

import BookingsList from '../components/Bookings/BookingList/BookingsList'
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingsControls from '../components/Bookings/BookingsControls/BookingsControls'


export default class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
    outputType: 'bookings'
  }

  static contextType = AuthContext;
  
  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({isLoading: true});
    const requestBody = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
              price
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
      const bookings = resData.data.bookings;
      this.setState({ bookings : bookings, isLoading: false });
    })
    .catch(err => {
      console.log(err);
      this.setState({ isLoading: false });
    }) 
  }

  deleteBookingHandler = bookingId => {
    const requestBody = {
      query: `
        mutation CalcelBooking($id: ID!) {
          cancelBooking(bookingId: $id) { 
            _id
            title
          }
        }
      `,
      variables: { //viriables is another way to pass along data w/o using template literals
        id: bookingId
      }
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
      this.setState(prevState => {
        const updatedBookings = prevState.bookings.filter(booking => { //filtering out booking that was canceled in BookingsList
          return booking._id !== bookingId;
        })
        return { bookings: updatedBookings, isLoading: false }
      });
    })
    .catch(err => {
      console.log(err);
      this.setState({ isLoading: false });
    }) 
  };

  changeOutputTypeHandler = outputType => {
    if (outputType === 'bookings') {
      this.setState({ outputType: 'bookings' })
    } else {
      this.setState({ outputType: 'chart' })
    }
  }

  render() {
    let content = <Spinner />;

    if(!this.state.isLoading) {
      content = (
        <React.Fragment>
          <BookingsControls 
            activeOutPutType={this.state.outputType}
            onChange={this.changeOutputTypeHandler}/>
          
          <div>
            {this.state.outputType === 'bookings' ? (
              <BookingsList 
                bookings={this.state.bookings}
                onDelete={this.deleteBookingHandler}/>
              
              ) : (
              <BookingsChart bookings={this.state.bookings}/>
             )}
          </div>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        {content}
      </React.Fragment>
    )
  }
}
