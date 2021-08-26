import React, { Component } from 'react';
import { editGroup, getGroup, getListUserForAddGroup, deleteUserGroup } from '../util/APIUtils';
//import { API_BASE_URL} from '../constants';
//import './NewGroup.css';
import {
    NAME_MIN_LENGTH, NAME_MAX_LENGTH,
    USER_MAX_LENGTH
} from '../constants';
import {
    SearchOutlined
} from '@ant-design/icons';
import { Form, Input, Button, notification, Mentions, Select, Space, Avatar, Table, Modal } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { getMentions } = Mentions;

class EditGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: {
                value: '',
                validateStatus: 'success'
            },
            code: {
                value: ''
            },
            users: [],
            usersSend: [],
            group: {
                member: []
            },
            loading: false,
            visible: false,
            currentUserId: 0,
            currentUserIndex: 0
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }
    validateUsers = (mentions) => {
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
    componentDidUpdate(nextProps) {
        //console.log("didupdate")
        if (this.props.match.params.code !== nextProps.match.params.code) {
            // Reset State 
            //console.log("next")
            // if (this._isMounted) {
            this.setState({
                name: {
                    value: '',
                    validateStatus: 'success'
                },
                code: {
                    value: ''
                },
                users: [],
                usersSend: [],
                group: {
                    member: []
                },
                loading: false
            });
            this.setState({
                code: {
                    value: this.props.match.params.code
                }
            })
            this.loadGroup(this.props.match.params.code);

        }
    }
    componentWillUnmount() {
    }
    componentDidMount() {
        this.setState({
            code: {
                value: this.props.match.params.code
            }
        })
        this.loadGroup(this.props.match.params.code);

    }
    loadGroup = (code) => {
        let promise;
        promise = getGroup(code);

        if (!promise) {
            return;
        }
        this.setState({
            loading: true
        })
        promise
            .then(response => {
                // let users = response.filter((user) => {
                //     var check = true;
                //     this.state.usersSend.forEach((userSend) => {
                //         if (user.username == userSend) {
                //             check = false;
                //         }
                //     })
                //     return check;
                // })

                const name = this.state.name;
                this.setState({
                    group: response,
                    name: {
                        ...name,
                        value: response.name
                    },
                    loading: false,
                })



            }).catch(error => {
                this.setState({
                    loading: false
                })
            });

    }
    loadUserList = (key) => {
        let promise;
        promise = getListUserForAddGroup(key, this.state.code.value);

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
        editGroup(groupData)
            .then(response => {

                notification.success({
                    message: 'Polling App',
                    description: "Thank you! You're successfully created group!",
                });
                this.props.history.push("/groups/" + this.state.code.value);
            }).catch(error => {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });
    }

    isFormInvalid() {
        return !(this.state.name.validateStatus === 'success');
    }
    onSearch = search => {
        this.setState({ search, loading: !!search });
        //console.log('Search:', search);
        this.loadUserList(search);
    }
    onSelect = (value) => {
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
    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            this.setState({
                                searchText: selectedKeys[0],
                                searchedColumn: dataIndex,
                            });
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                // <Highlighter
                //   highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                //   searchWords={[this.state.searchText]}
                //   autoEscape
                //   textToHighlight={text ? text.toString() : ''}
                // />
                text
            ) : (
                text
            ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };
    handleCancel = () => {
        this.setState({
            visible: false,
            currentUserId: 0,
            currentUserIndex: 0
        })
    }
    onDeleteUser = (userId, userIndex) => {
        //console.log(userId)
        //console.log(userIndex)
        this.setState({
            visible: true,
            currentUserId: userId,
            currentUserIndex: userIndex
        })
    }
    onChange = (pagination, filters, sorter, extra) => {
        //console.log('params', pagination, filters, sorter, extra);
    }
    handleDeleteUserSubmit = () => {


        const group = this.state.group;
        //console.log(group);
        //console.log(this.state.currentUserId);
        //console.log(this.state.currentUserIndex);
        const groupMem = this.state.group.member.slice();
        // console.log(this.state.group.member);
        // groupMem.splice(this.state.currentUserIndex,1);
        // const newgroup = [...groupMem]
        // console.log(newgroup);
        deleteUserGroup(group.id, this.state.currentUserId).then(response => {
            groupMem.splice(this.state.currentUserIndex, 1);
            group.member = groupMem;
            //console.log(group);
            this.setState({
                group: group,

            });
            notification.success({
                message: 'Polling App',
                description: response.message || 'Remove User Succesfully!'
            });

        }).catch(error => {
            if (error.status === 401) {
                this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            }
        });
        this.setState({
            visible: false,
        })
    }
    render() {
        const columns = [
            {
                title: 'Mã',
                dataIndex: 'id',
                key: "id",
                sorter: {
                    compare: (a, b) => a.id - b.id,
                    multiple: 4,
                },
                width: 100,
                fixed: 'left',
                ...this.getColumnSearchProps('id'),
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: "username",
                sorter: {
                    compare: (a, b) => a.username.length - b.username.length,
                    multiple: 3,
                },
                width: 150,
                fixed: 'left',
                ...this.getColumnSearchProps('username'),
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: "name",
                sorter: {
                    compare: (a, b) => a.name.length - b.name.length,
                    multiple: 2,
                },
                width: 100,
                ...this.getColumnSearchProps('name'),
            },
            {
                title: 'Avatar',
                dataIndex: 'photo',
                key: "photo",
                width: 100,
                render: photo => photo == null ? "No Image" : <Avatar
                    //src={API_BASE_URL+"/file/getImage/" + photo} 
                    src={"https://drive.google.com/uc?export=view&id="+photo}
                    >
                </Avatar>,
            },
            {
                title: 'Action',
                dataIndex: 'action',
                key: "action",
                width: 90,
                fixed: 'right',
                render: (num, record, index) => record.username !== this.state.group.usernameAdmin && <Button type="danger" onClick={() => this.onDeleteUser(record.id, index)}>Delete</Button>,
            },
        ];
        // const mem = [...this.state.group.member];
        // const data = [];
        // this.state.group.member.forEach((mem) => {
        //     data.push({
        //         ...mem,
        //         key: mem.id
        //     })
        // })
        //console.log(this.state.group.member);
        //console.log(this.state.group)
        return (
            <>
                <Modal
                    title="Confirm your action"
                    visible={this.state.visible}
                    onOk={this.handleDeleteUserSubmit}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            No
                        </Button>,
                        <Button key="submit" type="primary" onClick={this.handleDeleteUserSubmit}>
                            Yes
                        </Button>,
                    ]}
                ><p>Are you want delete this user?</p>
                </Modal>
                <div className="signup-container">
                    <h1 className="page-title">Edit Group</h1>
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
                            <FormItem label="Code">
                                <Input
                                    size="large"
                                    name="code"
                                    autoComplete="off"
                                    placeholder="A unique code"
                                    value={this.state.code.value}
                                    disabled
                                    onChange={(event) => this.handleInputChange(event)} />
                            </FormItem>
                            <FormItem label="Thêm thành viên: " validateStatus={this.state.validateStatusUser}
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
                                    disabled={this.isFormInvalid()}>Update</Button>
                            </FormItem>
                        </Form>
                    </div>

                </div>
                <Table columns={columns} dataSource={this.state.group.member} rowKey="id" onChange={this.onChange} />
            </>
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

}

export default EditGroup;