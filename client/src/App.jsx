import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import axios from 'axios';
import './App.css';
import PDFViewer from './Dashboard'; // Import the PdfViewer component

function App() {
  const [count, setCount] = useState(0);
  const [members, setMembers] = useState([]);

  const fetchAPI = async () => {
      const response = await axios.get("http://127.0.0.1:3001/api");
      console.log(response.data.group_members);
      setMembers(response.data.group_members);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div>
          <h2>Group Members</h2>
          <ol>
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Here's where the PDF Viewer component is used in the app */}
      <PDFViewer />
    </>
  );
}

export default App;

