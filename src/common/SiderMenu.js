import React, { Component } from 'react';
import {
  Link,
  withRouter
} from 'react-router-dom';
import './SiderMenu.css';
import { Menu, Button, Popover,Modal,notification } from 'antd';
import { getAllGroups,deleteGroup,leaveGroup } from '../util/APIUtils';
import { GROUP_LIST_SIZE } from '../constants';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
class SiderMenu extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      listGroups: [],
      isLoading: false,
      last: false,
      visibleLeave: false,
      page: 0,
      visible: false,
      currentGroupIndex: 0
    }
  }
  loadListGroup = (page = 0) => {
    if (this.props.isAuthenticated) {
      if (this._isMounted) {
        this.setState({
          isLoading: true
        })
      }

      const list = this.state.listGroups.slice();
      getAllGroups(page, GROUP_LIST_SIZE)
        .then(response => {
          // console.log(response)
          if (this._isMounted) {
            this.setState({
              listGroups: list.concat(response.content),
              isLoading: false,
              page: response.page,
              last: response.last
            })
          }

        }).catch(error => {
          if (this._isMounted) {
            this.setState({
              isLoading: false
            })
          }
        });
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  componentDidMount() {
    this._isMounted = true;
    this.loadListGroup();
  }
  handleCancel=()=>{
    this.setState({
        visible: false,
        currentGroupIndex: 0
    })
  }
 onDeleteGroup=(groupIndex)=>{
    this.setState({
        visible: true,
        currentGroupIndex: groupIndex
    })
 }
 handleDeleteGroupSubmit=()=>{
   
    
    const listGroups = this.state.listGroups.slice();

    deleteGroup(listGroups[this.state.currentGroupIndex].id).then(response => {
      listGroups.splice(this.state.currentGroupIndex,1);
            this.setState({
              listGroups: listGroups  ,
                
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
 handleCancelLeave=()=>{
  this.setState({
    visibleLeave: false,
      currentGroupIndex: 0
  })
}
onLeaveGroup=(groupIndex)=>{
  this.setState({
    visibleLeave: true,
      currentGroupIndex: groupIndex
  })
}
handleLeaveGroupSubmit=()=>{
 
  
  const listGroups = this.state.listGroups.slice();

  leaveGroup(listGroups[this.state.currentGroupIndex].id).then(response => {
    listGroups.splice(this.state.currentGroupIndex,1);
          this.setState({
            listGroups: listGroups  ,
              
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
    visibleLeave: false,
  })
}
  render() {
    const { location } = this.props;
    //console.log(location.pathname)
    //console.log(this.props.key);
    const groupView = [];
    this.state.listGroups.forEach((group, groupIndex) => {
      groupView.push(<Menu.Item key={"/groups/" + group.code} style={{whiteSpace: 'normal', height: 'auto'}}><Link to={"/groups/" + group.code}></Link><span>{group.name}</span><Popover placement="right" title="Tùy chọn" content={<ManagerGroup code={group.code} onLeaveGroup={this.onLeaveGroup} onDeleteGroup={this.onDeleteGroup} currentUsername={this.props.currentUser.username} groupAdminUsername={group.usernameAdmin} groupIndex={groupIndex}/>} trigger="click">
        <Button type="text" shape="circle" style={{ float: "right" }} icon={<MoreOutlined />}></Button>
      </Popover></Menu.Item>)
    })
    //console.log(this.state.listGroups)
    return (
      <><Modal
      title="Confirm your action"
      visible={this.state.visible}
      onOk={this.handleDeleteGroupSubmit}
      onCancel={this.handleCancel}
      footer={[
          <Button key="back" onClick={this.handleCancel}>
              No
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleDeleteGroupSubmit}>
              Yes
          </Button>,
      ]}
  ><p>Are you want delete this group?</p>
  </Modal>
  <Modal
      title="Confirm your action"
      visible={this.state.visibleLeave}
      onOk={this.handleLeaveGroupSubmit}
      onCancel={this.handleCancelLeave}
      footer={[
          <Button key="back" onClick={this.handleCancelLeave}>
              No
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleLeaveGroupSubmit}>
              Yes
          </Button>,
      ]}
  ><p>Are you want leave this group?</p>
  </Modal>
          <Menu theme="light" mode="inline" className="scrollbox-content" selectedKeys={[location.pathname]}>
            <Menu.Item key="/group/new" icon={<PlusOutlined />}> <Link to="/group/new"> Tạo Group</Link></Menu.Item>
            <Menu.Divider />
            <Menu.ItemGroup key="g1" title="Nhóm đã tham gia">

              {groupView}

              {/* {this.state.isloading && (
                        <div className="demo-loading-container">
                            <LoadingIndicator />
                        </div>
                    )} */}


            </Menu.ItemGroup>
            {!this.state.last&&<Menu.Item key="more" onClick={()=>this.loadListGroup(this.state.page+1)}>Load more</Menu.Item>}
          </Menu>
       </>
    );
  }

}
function ManagerGroup(props) {
  return (
      <div>
          {props.currentUsername===props.groupAdminUsername&&<Link to={"/editgroup/"+props.code}><Button type="primary" style={{marginBottom:"10px"}} block>Edit</Button></Link>}
          {props.currentUsername===props.groupAdminUsername?<Button danger block onClick={() => props.onDeleteGroup(props.groupIndex)}>Delete Group</Button>:<Button danger block onClick={() => props.onLeaveGroup(props.groupIndex)}>Leave</Button>}
      </div>
  );
}
export default withRouter(SiderMenu);