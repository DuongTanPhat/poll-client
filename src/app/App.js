import React, {  useState, useEffect } from 'react';
import './App.css';
import {
  Route,
  withRouter,
  Switch,
  Link
} from 'react-router-dom';

import { getCurrentUser,getTopTag } from '../util/APIUtils';
import { ACCESS_TOKEN } from '../constants';

import PostList from '../poll/PostList';
import NewPost from '../poll/NewPost';
import Login from '../user/login/Login';
import Signup from '../user/signup/Signup';
import Profile from '../user/profile/Profile';
import AppHeader from '../common/AppHeader';
import NotFound from '../common/NotFound';
import LoadingIndicator from '../common/LoadingIndicator';
import PrivateRoute from '../common/PrivateRoute';
import {RedoOutlined} from '@ant-design/icons';
// import PrivateRoute2 from '../common/PrivateRoute2';
import { notification,Affix,Card, Button } from 'antd';
import { Layout } from 'antd';
import NewGroup from '../group/NewGroup';
import SiderMenu from '../common/SiderMenu';
import EditGroup from '../group/EditGroup';
import ChangePassword from '../user/ChangePassword';
import Verification from '../user/Verification';
const { Header, Sider, Content } = Layout;
//const { Content } = Layout;

const App = (props) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toptag,setTopTag]=useState([]);
  notification.config({
    placement: 'topRight',
    top: 70,
    duration: 3,
  });

  useEffect(() => {
    loadCurrentUser();
    loadTopTag();
  }, [])
  const readNoti = function(){
    currentUser.notificationCount--;
    setCurrentUser(currentUser);
  }
  const loadCurrentUser = function () {
    setIsLoading(true);
    getCurrentUser()
      .then(response => {
        setCurrentUser(response);
        setIsAuthenticated(true);
        setIsLoading(false);
      }).catch(error => {
        setIsLoading(false);
      });
  }
  const loadTopTag = function () {
    getTopTag()
      .then(response => {
        setTopTag(response);
      }).catch(error => {
        setTopTag([]);
      });
  }

  const handleLogout = function (redirectTo = "/", notificationType = "success", description = "You're successfully logged out.") {
    localStorage.removeItem(ACCESS_TOKEN);
    setCurrentUser(null);
    setIsAuthenticated(false);

    props.history.push(redirectTo);

    notification[notificationType]({
      message: 'Polling App',
      description: description,
    });
  }

  const handleLogin = function () {
    notification.success({
      message: 'Polling App',
      description: "You're successfully logged in.",
    });
    loadCurrentUser();
    props.history.push("/");
  }
  if (isLoading) {
    return <LoadingIndicator />
  }
  const tagViews = [];
  toptag.forEach((tag,index)=>{
    const uri = encodeURIComponent(tag.name);
    tagViews.push(<p key={index}><Link to={"/search/"+uri} key={index}>{tag.name}</Link>  <span style={{float:'right'}}>{tag.count}</span></p>)
  })
  return (
<Layout className="app-container">
      <Header>
      <AppHeader 
      readNoti = {readNoti}
      isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout} /></Header>
      <Layout>
        <Sider
          style={{
            height: "100vh",
            position: "fixed",
            maxHeight: "calc(100% - 64px)",
            left: 0
          }}
          className="sider scrollbox scrollbox_delayed"
        >
          {isAuthenticated&&<SiderMenu key={props.location.pathname==="/group/new"?1:props.location.pathname.indexOf("/editgroup/")!==-1?2:3} currentUser={currentUser} isAuthenticated={isAuthenticated}/>}
        </Sider>
        <Content className="app-content">
          <div className="container">
            <Switch>
              <Route exact path="/"
                render={(props) => <PostList isAuthenticated={isAuthenticated}
                  currentUser={currentUser} handleLogout={handleLogout} type="HOME" {...props} />}>
              </Route>
              <Route exact path="/poll-client"
                render={(props) => <PostList isAuthenticated={isAuthenticated}
                  currentUser={currentUser} handleLogout={handleLogout} type="HOME" {...props} />}>
              </Route>
              <Route path="/login"
                render={(props) => <Login onLogin={handleLogin} type="login" {...props} />}></Route>
                <Route path="/auth"
                render={(props) => <Verification onLogin={handleLogin} type="confirm" {...props} />}></Route>
              <Route path="/signup" component={Signup}></Route>
              <Route path="/users/:username"
                render={(props) => <Profile isAuthenticated={isAuthenticated} handleLogout={handleLogout} key={props.match.params.username} currentUser={currentUser} {...props} />}>
              </Route>
              <Route path="/post/:id" authenticated={isAuthenticated}
                render={(props) => <PostList isAuthenticated={isAuthenticated}
                currentUser={currentUser} key={props.match.params.id} handleLogout={handleLogout} type="ONE_POST" {...props} />}>
              </Route>
              <Route path="/search/:search" authenticated={isAuthenticated}
                render={(props) => <PostList isAuthenticated={isAuthenticated}
                currentUser={currentUser} key={props.match.params.search} handleLogout={handleLogout} type="SEARCH_POST" {...props} />}>
              </Route>
              <Route authenticated={isAuthenticated} path="/groups/:code"
                render={(props) => <PostList isAuthenticated={isAuthenticated}
                currentUser={currentUser} handleLogout={handleLogout} type="GROUP" {...props} />}>
              </Route>
              <PrivateRoute authenticated={isAuthenticated} path="/changepassword/:username" currentUser={currentUser} component={ChangePassword} handleLogout={handleLogout}></PrivateRoute>
              <PrivateRoute authenticated={isAuthenticated} path="/editgroup/:code" component={EditGroup} handleLogout={handleLogout}></PrivateRoute>
              <PrivateRoute authenticated={isAuthenticated} path="/poll/new" component={NewPost} handleLogout={handleLogout}></PrivateRoute>
              <PrivateRoute authenticated={isAuthenticated} path="/group/new" component={NewGroup} handleLogout={handleLogout}></PrivateRoute>
              <Route component={NotFound}></Route>
            </Switch>
          </div>
        </Content>
<Affix className="affix" offsetTop={220}>
        <Card title={"Top "+toptag.length+" Tag rank"} style={{ width: 300}} extra={<Button type="text" shape="circle" className="poll-info" icon={<RedoOutlined />} onClick={loadTopTag}></Button>}>
      {tagViews}
      {/* <p>{toptag[2].name}  Num: {toptag[2].count}</p>
      <p>{toptag[3].name}  Num: {toptag[3].count}</p>
      <p>{toptag[4].name}  Num: {toptag[4].count}</p> */}
    </Card>
        </Affix>
      </Layout>
    </Layout>
  );
}


// class App extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       currentUser: null,
//       isAuthenticated: false,
//       isLoading: false
//     }
//     this.handleLogout = this.handleLogout.bind(this);
//     this.loadCurrentUser = this.loadCurrentUser.bind(this);
//     this.handleLogin = this.handleLogin.bind(this);

//     notification.config({
//       placement: 'topRight',
//       top: 70,
//       duration: 3,
//     });    
//   }

//   loadCurrentUser() {
//     this.setState({
//       isLoading: true
//     });
//     getCurrentUser()
//     .then(response => {
//       this.setState({
//         currentUser: response,
//         isAuthenticated: true,
//         isLoading: false
//       });
//       console.log(this.state.isAuthenticated)
//     }).catch(error => {
//       this.setState({
//         isLoading: false
//       });  
//     });
//   }

//   componentDidMount() {
//     this.loadCurrentUser();
//   }

//   handleLogout(redirectTo="/", notificationType="success", description="You're successfully logged out.") {
//     localStorage.removeItem(ACCESS_TOKEN);

//     this.setState({
//       currentUser: null,
//       isAuthenticated: false
//     });

//     this.props.history.push(redirectTo);

//     notification[notificationType]({
//       message: 'Polling App',
//       description: description,
//     });
//   }

//   handleLogin() {
//     notification.success({
//       message: 'Polling App',
//       description: "You're successfully logged in.",
//     });
//     this.loadCurrentUser();
//     this.props.history.push("/");
//   }

//   render() {
//     if(this.state.isLoading) {
//       return <LoadingIndicator />
//     }
//     return (
//         <Layout className="app-container">
//           <AppHeader isAuthenticated={this.state.isAuthenticated} 
//             currentUser={this.state.currentUser} 
//             onLogout={this.handleLogout} />

//           <Content className="app-content">
//             <div className="container">
//               <Switch>      
//                 <Route exact path="/" 
//                   render={(props) => <PostList isAuthenticated={this.state.isAuthenticated} 
//                       currentUser={this.state.currentUser} handleLogout={this.handleLogout} {...props} />}>
//                 </Route>
//                 <Route path="/login" 
//                   render={(props) => <Login onLogin={this.handleLogin} {...props} />}></Route>
//                 <Route path="/signup" component={Signup}></Route>
//                 <Route path="/users/:username" 
//                   render={(props) => <Profile isAuthenticated={this.state.isAuthenticated} currentUser={this.state.currentUser} {...props}  />}>
//                 </Route>
//                 <PrivateRoute authenticated={this.state.isAuthenticated} path="/poll/new" component={NewPost} handleLogout={this.handleLogout}></PrivateRoute>
//                 <Route component={NotFound}></Route>
//               </Switch>
//             </div>
//           </Content>
//         </Layout>
//     );
//   }
// }

export default withRouter(App);
