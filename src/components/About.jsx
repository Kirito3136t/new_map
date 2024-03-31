import React, { useState, useEffect } from "react";
import { ref, onValue } from 'firebase/database';
import { Table } from 'react-bootstrap';
import StartFirebase from "./firebase";
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const RealtimeData = () => {
  const [tableData, setTableData] = useState([]);
  const [initialData, setInitialData] = useState([]); // New state for initial data
  const [filteredData, setFilteredData] = useState([]);
  const [openData, setOpenData] = useState([]);
  const [repairedData, setRepairedData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("open"); // "open" or "repaired"
  const history = useNavigate();

  // ... rest of the code remains the same ...
  const getLocationName = async (latitude, longitude) => {
    const apiKey = 'AIzaSyDnyb11tWZluAFYBaG8sEVYpu2L6nwIWPE';
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      // console.log(data)

      if (data.results && data.results.length > 0) {
        const locationName = data.results[0].formatted_address;
        return locationName;
      } else {
        return 'Unknown Location';
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Unknown Location';
    }

  
  };

  const handleSignOut = () => {
    const { auth } = StartFirebase();

    signOut(auth)
      .then(() => {
        console.log("Sign-out successful.");
        history('/');
      })
      .catch((error) => {
        console.error("Error during sign-out", error);
      });
  };

  useEffect(() => {
    const userId = 'rtSGeyCrs3a8sdLYlEjv7i8MsY93';
    const { database } = StartFirebase();
    const dbRef = ref(database, `UsersData/${userId}/readings`);

    onValue(dbRef, async (snapshot) => {
      let records = [];

      const data = snapshot.val();
      // console.log(data)

      if (data && typeof data === 'object') {
        const dataArray = Object.entries(data);

        for (const [key, childSnapshot] of dataArray) {
          let latitude = childSnapshot.latitude;
          let longitude = childSnapshot.longitude;

          if (latitude !== "" || longitude !== "") {
            const location = await getLocationName(latitude, longitude);
            records.push({ "latitude": latitude, "longitude": longitude, "location": location });
          }
        }
      }


      setTableData(records);
      setInitialData(records); // Save initial data
      setOpenData(records);

      // Update filteredData based on the searchKeyword
      const filteredData = records.filter(row =>
        row.location.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredData(filteredData);
    });
  }, [searchKeyword]);

  const handleSearchInputChange = (event) => {
    const keyword = event.target.value;
    setSearchKeyword(keyword);
  };

  const handleRepairedClick = (index) => {
    const selectedEntry = openData[index];

    // Move the selected entry from 'Open' to 'Repaired'
    setRepairedData([...repairedData, selectedEntry]);
    setOpenData(openData.filter((entry, i) => i !== index));
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleReset = () => {
    // Reset the state using the initial data
    setTableData(initialData);
    setOpenData(initialData);
    setRepairedData([]);
    setFilteredData([]);
    setSearchKeyword("");
  };

  const dataToRender = searchKeyword
  ? filteredData
  : activeTab === "open"
  ? openData
  : repairedData;


  return (
    <div>
      <label>Search by area name, pincode, location</label>
      <input
        label="Search by area name, pincode, location..."
        type="text"
        placeholder="Search by area name, pincode, location..."
        value={searchKeyword}
        onChange={handleSearchInputChange}
        style={{ marginBottom: '10px', padding: '8px' }}
      />

      <div>
        <button onClick={() => handleTabChange("open")}>Open</button>
        <button onClick={() => handleTabChange("repaired")}>Repaired</button>
        <button onClick={handleReset}>Reset</button>
      </div>

      <Table className="w-full" style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th></th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {dataToRender.map((row, index) => (
            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
              <td>{index + 1}</td>
              <td>{row.latitude}</td>
              <td>{row.longitude}</td>
              <td>{row.location}</td>
              <td>
                {activeTab === "open" ? (
                  <button onClick={() => handleRepairedClick(index)}>Repaired</button>
                ) : (
                  // Add any additional actions for the 'Repaired' tab here
                  <span>Repaired Action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default RealtimeData;