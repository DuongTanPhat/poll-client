import React, { Component } from 'react';
import {
  Link,
  withRouter
} from 'react-router-dom';
import { getUserNotification,readNotification } from '../util/APIUtils';
import './AppHeader.css';
import pollIcon from '../poll.svg';
import { Layout, Menu, Dropdown, Input, Badge} from 'antd';
import {
  DownOutlined, UserOutlined, HomeOutlined, BellOutlined
} from '@ant-design/icons';

import { formatDateTime } from '../util/Helpers';
const Header = Layout.Header;
const { Search } = Input;

class AppHeader extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      notification: [],
      page: 0,
      last: false,
      visible: false
    }
  }
  componentDidMount(){
    this._isMounted = true;
    this.loadUserNotification();
  }
  componentWillUnmount(){
    this._isMounted=false;
  }
  loadUserNotification = (page= 0, size = 5) => {
    getUserNotification(page, size)
      .then(response => {
        console.log(response)
        if (this._isMounted) {
        this.setState({
          notification: this.state.notification.concat(response.content),
          page: response.page,
          last: response.last
        })}
      }).catch(error => {
      });
  }
  handleMenuClick = ({ key })=> {
    if (key === "logout") {
      this.props.onLogout();
    }
    if (key === "profile") {
      // window.location.assign("./user/"+username)
    }
  }
  handleMenuClick2 = ({ key }) => {
    if(key!=="more"){
      const noti = this.state.notification.slice();
      if(this.props.currentUser.notificationCount>key){
        noti[key].read = true;
        
        readNotification(noti[key].id).then(response => {
        }).catch(error => {
        });
        
        const notiItem ={ ...noti[key]};
        //const noti2 = [...noti.slice(0,key),...noti.slice(key+1)];
        noti.splice(key,1);
        noti.splice(this.props.currentUser.notificationCount-1,0,notiItem);
        //noti2.splice(this.props.currentUser.notificationCount-1,0,notiItem);
        this.props.readNoti();
        this.setState({
          notification: noti
        })
      }
      

      this.props.history.push("/post/" + noti[key].sourceId);
      this.setState({visible:false})
    }
    else this.loadUserNotification(this.state.page+1);
  }
  handleVisibleChange = (flag) =>{
    this.setState({visible: flag});
  }
  onSearch = value => {
    if (value === "") this.props.history.push("/");
    else this.props.history.push("/search/" + value);
    console.log(value)
  }
  render(){
  let menuItems;
  if (this.props.currentUser) {
    menuItems = [
      <Menu.Item key="/">
        <Link to="/">
          <HomeOutlined className="nav-icon" />
        </Link>
      </Menu.Item>,
      <Menu.Item key="/poll/new">
        <Link to="/poll/new">
          <img src={pollIcon} alt="poll" className="poll-icon" />
        </Link>
      </Menu.Item>,
      <Menu.Item key="/notification" className="profile-menu">
        <ProfileDropdownMenu2
        visible={this.state.visible}
        handleVisibleChange={this.handleVisibleChange}
        last={this.state.last}
          notification={this.state.notification}
          currentUser={this.props.currentUser}
          handleMenuClick={this.handleMenuClick2} />
      </Menu.Item>,
      <Menu.Item key="/profile" className="profile-menu">

        <ProfileDropdownMenu
          currentUser={this.props.currentUser}
          handleMenuClick={this.handleMenuClick} />
      </Menu.Item>,

    ];
  } else {
    menuItems = [
      <Menu.Item key="/login">
        <Link to="/login">Login</Link>
      </Menu.Item>,
      <Menu.Item key="/signup">
        <Link to="/signup">Signup</Link>
      </Menu.Item>
    ];
  }

  return (
    <Header className="app-header">
      <div style={{ maxWidth: "1200px" }} className="container">
        <div className="app-title" >
          <Link to="/">Voting App</Link>
        </div>
        <Search placeholder="Search question post" allowClear onSearch={this.onSearch} style={{ width: 200, paddingTop: 15, marginLeft: "7%" }} />
        <Menu
          className="app-menu"
          mode="horizontal"
          selectedKeys={[this.props.location.pathname]}
          style={{ lineHeight: '64px' }} >
          {menuItems}
        </Menu>
      </div>
    </Header>
  );
}
}

function ProfileDropdownMenu(props) {
  const dropdownMenu = (
    <Menu onClick={(key) => props.handleMenuClick(key, props.currentUser.username)} className="profile-dropdown-menu">
      <Menu.Item key="user-info" className="dropdown-item" disabled>
        <div className="user-full-name-info">
          {props.currentUser.name}
        </div>
        <div className="username-info">
          @{props.currentUser.username}
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="profile" className="dropdown-item">
        <Link to={`/users/${props.currentUser.username}`}>Profile</Link>
      </Menu.Item>
      <Menu.Item key="updatepassword" className="dropdown-item">
        <Link to={`/changepassword/${props.currentUser.username}`}>Change Password</Link>
      </Menu.Item>
      <Menu.Item key="logout" className="dropdown-item" danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={dropdownMenu}
      trigger={['click']}
      getPopupContainer={() => document.getElementsByClassName('profile-menu')[0]}>
      <div className="ant-dropdown-link">
        <UserOutlined className="nav-icon" style={{ marginRight: 0 }} /><DownOutlined />
      </div>
    </Dropdown>
  );
}
const getTime = (time) => {
  if (time == null) return ""
  const timeNew = new Date(time).getTime();
  const currentTime = new Date().getTime();

  var difference_ms = currentTime - timeNew;
  var seconds = Math.floor((difference_ms / 1000) % 60);
  var minutes = Math.floor((difference_ms / 1000 / 60) % 60);
  var hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
  var days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

  let timeRemaining;
  if (days > 7) {
    timeRemaining = formatDateTime(time);
  }
  else if (days > 0) {
    timeRemaining = days + " ngày trước";
  } else if (hours > 0) {
    timeRemaining = hours + " giờ trước";
  } else if (minutes > 0) {
    timeRemaining = minutes + " phút trước";
  } else if (seconds > 0) {
    timeRemaining = seconds + " giây trước";
  } else {
    timeRemaining = "Vừa mới";
  }

  return timeRemaining;
}
function ProfileDropdownMenu2(props) {

  const notiViews = [];
  props.notification.forEach((noti, index) => {
    notiViews.push(<Menu.Item key={index} className="dropdown-item" style={noti.read ? { color: "#657786" } : {}}>
      <div>{noti.content}</div>
      <div>{getTime(noti.createAt)}</div>
    </Menu.Item>);
    if (index === props.currentUser.notificationCount - 1) notiViews.push(<Menu.Divider key="line"/>)
  })
  const dropdownMenu = (
    <Menu onClick={(key) => props.handleMenuClick(key, props.currentUser.username)} className="scroll">
      {notiViews}
      <Menu.Item key="more" className="dropdown-item">
      {!props.last&&<Link to="#">Load More...</Link>}</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      overlay={dropdownMenu}
      trigger={['click']}
      onVisibleChange={props.handleVisibleChange}
      visible={props.visible}
      getPopupContainer={() => document.getElementsByClassName('profile-menu')[0]}>
      <div className="ant-dropdown-link">
        <Badge size="small" count={props.currentUser.notificationCount} overflowCount={10}> <BellOutlined className="nav-icon" /></Badge>
      </div>
    </Dropdown>
  );
}

export default withRouter(AppHeader);