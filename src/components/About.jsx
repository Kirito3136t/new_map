import React, { useState, useEffect } from "react";
import { ref, onValue, push, remove } from "firebase/database";
import { Table } from "react-bootstrap";
import StartFirebase from "./firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import emailjs from 'emailjs-com';

const RealtimeData = () => {
  const [tableData, setTableData] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openData, setOpenData] = useState([]);
  const [repairedPotholesData, setRepairedPotholesData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [depthSeverity, setDepthSeverity] = useState([]);
  const history = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {

        
        const userId = "rtSGeyCrs3a8sdLYlEjv7i8MsY93";
        const { database } = StartFirebase();
        const dbRef = ref(database, `UsersData/${userId}/readings`);

        onValue(dbRef, async (snapshot) => {
          let records = [];

          const data = snapshot.val();
          console.log("The data is", data);

          if (data && typeof data === "object") {
            const dataArray = Object.entries(data);

            const locationCount = {};
            const coordinatesCount = {};
            const locationDepthMap = new Map();

            for (const [key, childSnapshot] of dataArray) {
              let latitude = childSnapshot.latitude;
              let longitude = childSnapshot.longitude;
              let depth = childSnapshot.depth ? childSnapshot.depth : 0.0;

              if (latitude !== "" || longitude !== "") {
                const location = await getLocationName(latitude, longitude);
                const coordinateKey = `${latitude}-${longitude}`;
                const locationKey = location.toLowerCase();
                const depthKey = `${locationKey}-${depth}`;

                locationCount[locationKey] = (locationCount[locationKey] || 0) + 1;
                coordinatesCount[coordinateKey] = (coordinatesCount[coordinateKey] || 0) + 1;

                if (locationDepthMap.has(depthKey)) {
                  continue;
                }
                locationDepthMap.set(depthKey, true);

                records.push({
                  id: key,
                  latitude: latitude,
                  longitude: longitude,
                  location: location,
                  depth: depth,
                  priority: 1,
                });
              }
            }

            // Update priority based on location and coordinates
            records.forEach((record) => {
              const locationKey = record.location.toLowerCase();
              const coordinateKey = `${record.latitude}-${record.longitude}`;
              record.priority = Math.max(locationCount[locationKey], coordinatesCount[coordinateKey]);

              // Calculate depth severity
              const depthValue = parseFloat(record.depth);
              let severity = "";

              if ((depthValue >= 0 && depthValue < 20) || (depthValue > 340 && depthValue < 360)) {
                severity = "Low";
              } else if ((depthValue > 20 && depthValue < 45) || (depthValue > 315 && depthValue < 340)) {
                severity = "Medium";
              } else if ((depthValue > 45 && depthValue < 90) || (depthValue > 224 && depthValue < 315)) {
                severity = "High";
              }

              // Add severity to the record
              record.depthSeverity = severity;
            });

            // Sort records by priority in descending order
            records.sort((a, b) => b.priority - a.priority);

            // Display unique records once
            // const uniqueRecords = [];
            // const uniqueCoordinates = new Set();
            // records.forEach((record) => {
            //   const coordinateKey = `${record.latitude}-${record.longitude}`;
            //   if (!uniqueCoordinates.has(coordinateKey)) {
            //     uniqueCoordinates.add(coordinateKey);
            //     uniqueRecords.push(record);
            //   }
            // });

            setTableData(records);
            setInitialData(records);
            setOpenData(records);

            // const filteredData = uniqueRecords.filter((row) =>
            //   row.location.toLowerCase().includes(searchKeyword.toLowerCase())
            // );
            // setFilteredData(filteredData);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [searchKeyword]);

  useEffect(() => {
    const userId = "rtSGeyCrs3a8sdLYlEjv7i8MsY93";
    const { database } = StartFirebase();
    const repairedPotholesRef = ref(
      database,
      `UsersData/${userId}/repairedPotholes`
    );

    onValue(repairedPotholesRef, (snapshot) => {
      const data = snapshot.val();

      if (data && typeof data === "object") {
        const dataArray = Object.values(data);

        // Update priority and depth severity for repaired potholes
        dataArray.forEach((record) => {
          // Calculate depth severity
          const depthValue = parseFloat(record.depth);
          let severity = "";

          if ((depthValue >= 0 && depthValue < 20) || (depthValue > 340 && depthValue < 360)) {
            severity = "Low";
          } else if ((depthValue > 20 && depthValue < 45) || (depthValue > 315 && depthValue < 340)) {
            severity = "Medium";
          } else if ((depthValue > 45 && depthValue < 90) || (depthValue > 224 && depthValue < 315)) {
            severity = "High";
          }

          // Add severity to the record
          record.depthSeverity = severity;
        });

        setRepairedPotholesData(dataArray);
      }
    });
  }, []);

  const getLocationName = async (latitude, longitude) => {
    const apiKey = "AIzaSyAIqk3oz4aS5DDAH5ZzZtcrJwNbG-PqGPY"; // Replace with your Google Maps API key
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const locationName = data.results[0].formatted_address;
        return locationName;
      } else {
        return "Unknown Location";
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Unknown Location";
    }
  };

  const handleSignOut = () => {
    const { auth } = StartFirebase();

    signOut(auth)
      .then(() => {
        console.log("Sign-out successful.");
        history("/");
      })
      .catch((error) => {
        console.error("Error during sign-out", error);
      });
  };

  const handleNotifyClick = async (row) => {
    try {
      const templateId = 'template_blamlnh'; // Replace with your EmailJS template ID
      const apiKey = 'FYWwEAz0aYBtTbAwz'; // Replace with your EmailJS public API key
      const serviceId = 'service_uztw38r';

      const emailParams = {
        to_name: 'State Road Authority',
        from_name: 'Your Name',

        message: `
        Dear State Road Authority,

        I trust this message finds you well. I am writing to draw your attention to a critical matter that demands immediate consideration.
        
        We have observed a road condition issue at the following location:
        
        -Location: ${row.location}
        -Latitude: ${row.latitude}
        -Longitude: ${row.longitude}
        -Depth: ${row.depth}
        
        This concern requires urgent attention as it may pose a potential risk to road users. We kindly urge you to promptly assess and address the situation to ensure the safety of commuters.
        
        Your immediate action on this matter is highly valued. Should you need additional information or assistance, please do not hesitate to contact us at [Your Contact Information].
        
        Thank you for your swift response to this pressing issue.
        
        Best regards,
        
        Ministry of Road Transport and Highways
        [Your Position]
        [Your Contact Information]
        `,
      };

      const response = await emailjs.send(serviceId, templateId, emailParams, apiKey);

      console.log('Email sent successfully', response);
      // Handle success or failure
    } catch (error) {
      console.error('Error sending email:', error);
      // Handle error
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRepairedClick = async (index) => {
    const selectedEntry = openData[index];
  
    setOpenData(openData.filter((entry, i) => i !== index));
  
    const userId = "rtSGeyCrs3a8sdLYlEjv7i8MsY93";
    const { database } = StartFirebase();
    const repairedPotholesRef = ref(
      database,
      `UsersData/${userId}/repairedPotholes`
    );
    const readingsRef = ref(database, `UsersData/${userId}/readings`);
  
    try {
      await push(repairedPotholesRef, selectedEntry);
      console.log("Pothole marked as repaired and saved to the database.");
  
      const potholeRef = ref(readingsRef, selectedEntry.id);
      await remove(potholeRef);
      console.log("Pothole entry removed from readings.");
    } catch (error) {
      console.error("Error saving or removing pothole data:", error);
    }
  };
  
 

  const handleSearchInputChange = (event) => {
    const keyword = event.target.value.toLowerCase();

    const filteredData = initialData.filter((row) =>
      row.location.toLowerCase().includes(keyword)
    );

    setFilteredData(filteredData);
    setSearchKeyword(keyword);
  };

  const dataToRender = searchKeyword
    ? filteredData
    : activeTab === "open"
    ? openData
    : repairedPotholesData;

  return (
    <div>
      <nav className="bg-gray-400 border-white-200 dark:bg-gray-200 sm:rounded-lg">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4 ">
          <div className="relative hidden md:block">
            <input
              type="text"
              id="search-navbar"
              className="block w-96 p-2 text-sm text-gray-100 border border-gray-600 rounded-lg bg-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search by location..."
              value={searchKeyword}
              onChange={handleSearchInputChange}
            />
          </div>

          <button
            style={{
              backgroundColor: "#4b5563",
              borderRadius: "3px",
              width: "100px",
              height: "40px",
              transition: "background-color 0.3s",
            }}
            className="md:ml-4 p-2 text-sm text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:text-gray-100 dark:hover:text-gray-100 dark:focus:ring-gray-600"
            onClick={handleSignOut}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#00df9a")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#4b5563")}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div
        style={{
          width: "fit-content",
          display: "flex",
          justifyContent: "center",
          borderRadius: "5px",
          paddingLeft: "45%",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => handleTabChange("open")}
          style={{
            padding: "10px 15px",
            border: "none",
            borderBottom: activeTab === "open"
              ? "3px solid #00df9a"
              : "none",
            borderRadius: "5px 0 0 5px",
            cursor: "pointer",
            backgroundColor: activeTab === "open" ? "#00df9a" : "#fff",
            color: activeTab === "open" ? "#fff" : "#333",
          }}
        >
          Open
        </button>
        <button
          onClick={() => handleTabChange("repaired")}
          style={{
            padding: "10px 15px",
            border: "none",
            borderBottom:
              activeTab === "repaired" ? "3px solid #00df9a" : "none",
            borderRadius: "0 5px 5px 0",
            cursor: "pointer",
            backgroundColor: activeTab === "repaired" ? "#00df9a" : "#fff",
            color: activeTab === "repaired" ? "#fff" : "#333",
          }}
        >
          Repaired
        </button>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Index
              </th>
              <th scope="col" className="px-6 py-3">
                Latitude
              </th>
              <th scope="col" className="px-6 py-3">
                Longitude
              </th>
              <th scope="col" className="px-6 py-3">
                Location
              </th>
              <th scope="col" className="px-6 py-3">
                Depth
              </th>
              {activeTab === "open" && (
                <>
                  <th scope="col" className="px-6 py-3">
                    Depth Severity
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Notification
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {dataToRender.map((row, index) => (
              <tr
                className="odd:bg-white text-black odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                }}
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-large text-gray-900 whitespace-nowrap dark:text-black"
                >
                  {index + 1}
                </th>
                <td className="px-6 py-4 ">{row.latitude}</td>
                <td className="px-6 py-4">{row.longitude}</td>
                <td className="px-6 py-4">{row.location}</td>
                <td className="px-6 py-4">{row.depth}</td>
                {activeTab === "open" && (
                  <>
                    <td
                      className={`px-6 py-4 depth-severity ${
                        row.depthSeverity === "Low"
                          ? "bg-green-500"
                          : row.depthSeverity === "Medium"
                          ? "bg-orange-500"
                          : row.depthSeverity === "High"
                          ? "bg-red-500"
                          : ""
                      }`}
                    >
                      {row.depthSeverity}
                    </td>
                    <td
                      className={`px-6 py-4 priority ${
                        row.priority > 5
                          ? "bg-red-500"
                          : row.priority > 2
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                    >
                      {row.priority > 5
                        ? "High"
                        : row.priority > 2
                        ? "Medium"
                        : "Low"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRepairedClick(index)}
                        style={{
                          backgroundColor: "#00df9a",
                          color: "#000",
                          borderRadius: "3px",
                          width: "80px",
                          height: "40px",
                          transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#04AF70")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#00df9a")
                        }
                      >
                        Repaired
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleNotifyClick(row)}
                        style={{
                          backgroundColor: "#00df9a",
                          color: "#000",
                          borderRadius: "3px",
                          width: "80px",
                          height: "40px",
                          transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.backgroundColor = "#04AF70")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.backgroundColor = "#00df9a")
                        }
                      >
                        Notify
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RealtimeData;
