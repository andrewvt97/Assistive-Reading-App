import { useState, useEffect } from 'react';
import Soar from '../styles/Soar3.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import pfp from '../styles/pfp.png';
import emoji from 'emoji-dictionary'
import { motion } from 'framer-motion'

axios.defaults.withCredentials = true;

function App() {
  const [count, setCount] = useState(0);
  const [members, setMembers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const fetchAPI = async () => {
      const response = await axios.get("http://127.0.0.1:3001/");
      setMembers(response.data.group_members);

      try {
        const user = await axios.get("http://127.0.0.1:3001/is_logged_in");
        setLoggedIn(user.data.logged_in);
        setUsername(user.data.user_id);
        console.log(user) /* debug */
      } catch (error) {
        console.log(error.response.data);
      }
  };

  const handleLogout = async () => {
    axios.post('http://127.0.0.1:3001/logout', {}, { withCredentials: true })
         .then(response => {
             console.log('Logout successful:', response.data);
             window.location = '/';
         })
         .catch(error => {
             console.error('Logout failed:', error);
         });
};


  useEffect(() => {
    fetchAPI();
  }, []);

  return (      
    <motion.body
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div className='content'>
    <>
      <div className="header">
      <div className="home-links">
      {loggedIn ? 
          <Link to="/dashboard" className="dashboard-button">Dashboard</Link> :
          <span className="dashboard-button-disabled">Login to Access</span>
          }
      </div>
      <div className="logo-container">
        <img src={Soar} className="logo" alt="Soar logo" />
      </div>
      <div className="account-links">
        {loggedIn ? (
          <>
            <div className="PFP-container">
              <img src={pfp} alt="Profile" className="PFP"/>
            </div>
            <button className="logout-button" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">Login</Link>
            <Link to="/create-account" className="create-button">New Here?</Link>
          </>
        )}
      </div>
    </div>
      
      <motion.div className="card"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        bounce: 0.1
      }}
      >
      {loggedIn ? (
        <>
          <h1>Hey, {username}! {emoji.getUnicode("wave")}</h1> 
          <h2>Thanks for using our app.</h2>
          <h2>Go ahead and click Dashboard to begin your journey.</h2>
          </>
        ) : ( 
          <h1>Assistive Reading App</h1> 
        )}
        <div>
        </div>
      </motion.div>
      <h2 className='GroupMem'>Group Members</h2>
          <ol>
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ol>
    </>
    </div>
    </motion.body>
  );
}

export default App;
