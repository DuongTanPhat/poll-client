import React, { Component } from 'react';
import { changePassword } from '../util/APIUtils';
//import './Signup.css';
import { 
    PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH
} from '../constants';
import { LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, notification } from 'antd';
const FormItem = Form.Item;

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newpassword: {
                value: ''
            },
            currentpassword: {
                value: ''
            }
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }

    handleInputChange(event, validationFun) {
        const target = event.target;
        const inputName = target.name;        
        const inputValue = target.value;

        this.setState({
            [inputName] : {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });
    }

    handleSubmit() {
    
        const changePasswordRequest = {
            newPassword: this.state.newpassword.value,
            currentPassword: this.state.currentpassword.value
        };
        changePassword(changePasswordRequest)
        .then(response => {
            notification.success({
                message: 'Polling App',
                description: "Thank you! You're successfully update password!",
            });          
            this.props.history.push("/users/"+this.props.currentUser.username);
        }).catch(error => {
            notification.error({
                message: 'Polling App',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    isFormInvalid() {
        return !(
            this.state.newpassword.validateStatus === 'success' &&
            this.state.currentpassword.validateStatus === 'success'
        );
    }

    render() {
        return (
            <div className="signup-container">
                <h1 className="page-title">Change Password</h1>
                <div className="signup-content">
                    <Form onFinish={this.handleSubmit} className="signup-form">
                        <FormItem 
                        label="Current Password"
                            validateStatus={this.state.currentpassword.validateStatus}
                            help={this.state.currentpassword.errorMsg}>
                            <Input.Password 
                        prefix={<LockOutlined />}
                                size="large"
                                name="currentpassword"
                                type="password"
                                autoComplete="off"
                                placeholder="Your curent password"
                                value={this.state.currentpassword.value} 
                                onChange={(event) => this.handleInputChange(event, this.validatePassword)} />    
                        </FormItem>
                        <FormItem 
                        label="New Password"
                            validateStatus={this.state.newpassword.validateStatus}
                            help={this.state.newpassword.errorMsg}>
                            <Input.Password 
                        prefix={<LockOutlined />}
                                size="large"
                                name="newpassword" 
                                type="password"
                                autoComplete="off"
                                placeholder="Your new password" 
                                value={this.state.newpassword.value} 
                                onChange={(event) => this.handleInputChange(event, this.validatePassword)} />    
                        </FormItem>
                        <FormItem>
                            <Button type="primary" 
                                htmlType="submit" 
                                size="large" 
                                className="signup-form-button"
                                disabled={this.isFormInvalid()}>Update Password</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }


    validatePassword = (password) => {
        if(password.length < PASSWORD_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Password is too short (Minimum ${PASSWORD_MIN_LENGTH} characters needed.)`
            }
        } else if (password.length > PASSWORD_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Password is too long (Maximum ${PASSWORD_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };            
        }
    }

}

export default ChangePassword;