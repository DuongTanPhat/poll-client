import React, { Component } from 'react';
import { createGroup, checkGroupCodeAvailability,getListUser } from '../util/APIUtils';
import './NewGroup.css';
import {
    NAME_MIN_LENGTH, NAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH,
    USER_MAX_LENGTH
} from '../constants';

import { Form, Input, Button, notification,Mentions,Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { getMentions } = Mentions;

class NewGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: {
                value: ''
            },
            code: {
                value: ''
            },
            users: [],
            usersSend: []
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateGroupCodeAvailability = this.validateGroupCodeAvailability.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }
    validateUsers = (mentions) =>{
        //console.log(mentions.length)
        if (mentions.length === 0) {
            return {
                validateStatusUser: 'error',
                errorMsgUser: 'Please enter a username!'
            }
        } else if (mentions.length > USER_MAX_LENGTH) {
            return {
                validateStatusUser: 'error',
                errorMsgUser: `User is too much (Maximum ${USER_MAX_LENGTH} user allowed)`
            }
        } else {
            return {
                validateStatusUser: 'success',
                errorMsgUser: null
            }
        }
    }
    loadUserList = (key) => {
        let promise;
        promise = getListUser(key, "username");

        if (!promise) {
            return;
        }
        promise
            .then(response => {
                let users = response.filter((user) => {
                    var check = true;
                    this.state.usersSend.forEach((userSend) => {
                        if (user.username === userSend) {
                            check = false;
                        }
                    })
                    return check;
                })
                this.setState({
                    users: users,
                    loading: false,
                })



            }).catch(error => {
                // this.setState({
                //     users: response
                // })
            });

    }
    handleInputChange(event, validationFun) {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;
        //console.log(this.state.code.value)
        this.setState({
            [inputName]: {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });
    }

    handleSubmit() {
        const groupData = {
            name: this.state.name.value,
            code: this.state.code.value,
            usersUsername: this.state.usersSend
        };
        createGroup(groupData)
            .then(response => {
                notification.success({
                    message: 'Polling App',
                    description: "Thank you! You're successfully created group!",
                });
                this.props.history.push("/");
            }).catch(error => {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });
    }

    isFormInvalid() {
        return !(this.state.name.validateStatus === 'success' &&
            this.state.code.validateStatus === 'success'
        );
    }
    onSearch = search => {
        this.setState({ search, loading: !!search });
        //console.log('Search:', search);
        this.loadUserList(search);
    }
    onSelect = (value)=> {
        const mentions = getMentions(value);
        //console.log(mentions)
        const usersSend = [];
        mentions.forEach((mention) => {
            usersSend.push(mention.value);
        })
        this.setState({
            usersSend: usersSend,
            ...this.validateUsers(usersSend)
        })
        //console.log(this.state.usersSend);
    }
    render() {
        return (
            <div className="signup-container">
                <h1 className="page-title">Create Group</h1>
                <div className="signup-content">
                    <Form onFinish={this.handleSubmit} className="signup-form">
                        <FormItem
                            label="Full Name"
                            validateStatus={this.state.name.validateStatus}
                            help={this.state.name.errorMsg}>
                            <Input
                                size="large"
                                name="name"
                                autoComplete="off"
                                placeholder="Group name"
                                value={this.state.name.value}
                                onChange={(event) => this.handleInputChange(event, this.validateName)} />
                        </FormItem>
                        <FormItem label="Code"
                            hasFeedback
                            validateStatus={this.state.code.validateStatus}
                            help={this.state.code.errorMsg}>
                            <Input
                                size="large"
                                name="code"
                                autoComplete="off"
                                placeholder="A unique code"
                                value={this.state.code.value}
                                onBlur={this.validateGroupCodeAvailability}
                                onChange={(event) => this.handleInputChange(event, this.validateGroup)} />
                        </FormItem>
                        <FormItem label="Thành viên: " validateStatus={this.state.validateStatusUser}
                            help={this.state.errorMsgUser}><Mentions style={{ width: '100%' }} placeholder="Nhập '@' để tag bạn bè" loading={this.state.loading} onSearch={this.onSearch} onChange={this.onSelect}>
                                {this.state.users.map(({ id, username, name }) => (
                                    <Option key={id} value={username} className="antd-demo-dynamic-option">
                                        <span>{name} @{username}</span>
                                    </Option>
                                ))}
                            </Mentions></FormItem>
                        <FormItem>
                            <Button type="primary"
                                htmlType="submit"
                                size="large"
                                className="signup-form-button"
                                disabled={this.isFormInvalid()}>Create</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }

    // Validation Functions

    validateName = (name) => {
        if (name.length < NAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Name is too short (Minimum ${NAME_MIN_LENGTH} characters needed.)`
            }
        } else if (name.length > NAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Name is too long (Maximum ${NAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
    }

    validateGroup = (groupCodeValue) => {
        if (groupCodeValue.length < USERNAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `GroupCode is too short (Minimum ${USERNAME_MIN_LENGTH} characters needed.)`
            }
        } else if (groupCodeValue.length > USERNAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `GroupCode is too long (Maximum ${USERNAME_MAX_LENGTH} characters allowed.)`
            }
        }
        else if (groupCodeValue.indexOf(' ') !== -1) {
            return {
                validationStatus: 'error',
                errorMsg: `GroupCode is valid (' ' characters not allowed.)`
            }
        }
        else {
            return {
                validateStatus: null,
                errorMsg: null
            }
        }
    }

    validateGroupCodeAvailability() {
        // First check for client side errors in username
        const groupCodeValue = this.state.code.value;
        const groupValidation = this.validateGroup(groupCodeValue);

        if (groupValidation.validateStatus === 'error') {
            this.setState({
                code: {
                    value: groupCodeValue,
                    ...groupValidation
                }
            });
            return;
        }

        this.setState({
            code: {
                value: groupCodeValue,
                validateStatus: 'validating',
                errorMsg: null
            }
        });

        checkGroupCodeAvailability(groupCodeValue)
            .then(response => {
                if (response.available) {
                    this.setState({
                        code: {
                            value: groupCodeValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    this.setState({
                        code: {
                            value: groupCodeValue,
                            validateStatus: 'error',
                            errorMsg: 'This username is already taken'
                        }
                    });
                }
            }).catch(error => {
                // Marking validateStatus as success, Form will be recchecked at server
                this.setState({
                    code: {
                        value: groupCodeValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                });
            });
    }
}

export default NewGroup;