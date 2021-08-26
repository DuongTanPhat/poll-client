import React, { Component } from 'react';
import { login,confirmMail } from '../../util/APIUtils';
import './Login.css';
import { Link } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../constants';
import { UserOutlined,LockOutlined } from '@ant-design/icons';

import { Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;


class LoginForm extends Component {
    
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount(){
        console.log(this.props.type)
        if(this.props.type === "confirm"){
            this.props.history.push("/login");
            confirmMail(this.props.match.params.code)
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
    }
    handleSubmit = values => {
                const loginRequest = Object.assign({}, values);
                login(loginRequest)
                .then(response => {
                    localStorage.setItem(ACCESS_TOKEN, response.accessToken);
                    this.props.onLogin();
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
                <h1 className="page-title">Login</h1>
                <div className="login-content">
            <Form onFinish={this.handleSubmit} className="login-form">
                <FormItem name="usernameOrEmail" rules =  {[{ required: true, message: 'Please input your username or email!' }]}>
                    <Input 
                        prefix={<UserOutlined />}
                        size="large"
                        name="usernameOrEmail" 
                        autoComplete="usernameOrEmail"
                        placeholder="Username or Email" />    
                </FormItem>
                <FormItem name = "password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                    <Input.Password 
                        prefix={<LockOutlined />}
                        size="large"
                        name="password" 
                        type="password" 
                        autoComplete="password"
                        placeholder="Password"  />                   
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" size="large" className="login-form-button">Login</Button>
                    Or <Link to="/signup">register now!</Link>
                </FormItem>
            </Form>
            </div>
            </div>
        );
    }
}


export default LoginForm;