import React, { Component } from 'react';
import { confirmMail } from '../util/APIUtils';
// import './Login.css';

import { Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;


class Verification extends Component {
    
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount(){

    }
    handleSubmit = values => {
        console.log(values)
        confirmMail(values.code)
            .then(response => {
                notification.success({
                    message: 'Polling App',
                    description: 'Your accout is Active. Welcome to website!'
                });   
                this.props.history.push("/login");
            }).catch(error => {
                if(error.status === 401) {
                    notification.error({
                        message: 'Polling App',
                        description: 'Your Username or Password is incorrect. Please try again!'
                    });                    
                } else {
                    notification.error({
                        message: 'Polling App',
                        description: error.message || 'Sorry! Something went wrong. Please try again!'
                    });                                            
                }
            });
            }

    render() {
        //const { getFieldDecorator } = this.props.form;
        return (
            <div className="login-container">
                <h1 className="page-title">Verification</h1>
                <div className="login-content">
            <Form onFinish={this.handleSubmit} className="login-form">
                <FormItem name="code" rules =  {[{ required: true, message: 'Please input your verification code!' }]}>
                    <Input 
                        size="large"
                        name="code" 
                        autoComplete="code"
                        placeholder="Verification Code" />    
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" size="large" className="login-form-button">Verification</Button>
                </FormItem>
            </Form>
            </div>
            </div>
        );
    }
}


export default Verification;