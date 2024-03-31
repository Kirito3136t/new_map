import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  Stack, 
  Badge
} from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import { ref, onValue } from 'firebase/database';
import StartFirebase from "./firebase";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  Circle
} from "@react-google-maps/api";
import { useRef, useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

const center = { lat: 19.0522, lng: 72.9005 };


function Legend() {
  return (
    <Box position="absolute" bottom={4} right={4}>
      <Stack direction="row" spacing={4}>
        <Badge colorScheme="green">Low Pothole Density</Badge>
        <Badge colorScheme="orange">Medium Pothole Density</Badge>
        <Badge colorScheme="red">High Pothole Density</Badge>
      </Stack>
    </Box>
  );
}

function Map() {
  const [readings, setReadings] = useState([]);
  const [resulting,setResulting]=useState();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = 'rtSGeyCrs3a8sdLYlEjv7i8MsY93';
    const { database } = StartFirebase();
    const dbRef = ref(database, `UsersData/${userId}/readings`);
  
    onValue(dbRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const readingsArray = Object.values(data)
          .filter(reading => typeof reading.latitude === 'number' && typeof reading.longitude === 'number')
          .map((reading) => ({
            lat: reading.latitude,
            lng: reading.longitude,
          }));
        setReadings(readingsArray);
      }
    });
  }, []);
  

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAIqk3oz4aS5DDAH5ZzZtcrJwNbG-PqGPY",
    libraries: ["places"],
  });

  const handleGoback = () =>{
    navigate('/')
  }

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
 

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();



  if (!isLoaded) {
    return <SkeletonText />;
  }


  const getDensityColor = (index, potholeDensity, route) => {
    const densityThresholds = {
      low: 0.1,
      medium: 0.3,
    };
  
    const potholeLatLng = new window.google.maps.LatLng(
      readings[index].lat,
      readings[index].lng
    );
  
    // Calculate distance of pothole from the route
    const distanceToRoute = window.google.maps.geometry.spherical.computeDistanceBetween(
      potholeLatLng,
      route.overview_path[0]
    );
  
    // Find the minimum distance among all potholes
    const minDistance = Math.min(
      ...readings.map((location, i) => {
        if (i !== index) {
          const otherPotholeLatLng = new window.google.maps.LatLng(
            location.lat,
            location.lng
          );
          return window.google.maps.geometry.spherical.computeDistanceBetween(
            otherPotholeLatLng,
            route.overview_path[0]
          );
        }
        return Infinity;
      })
    );
  
    if (distanceToRoute === 0) {
      return "red"; // Pothole is on the route
    } else if (distanceToRoute === minDistance) {
      return "red"; // Pothole with minimum distance
    } else if (index / readings.length <= densityThresholds.low) {
      return "green"; // Low density
    } else if (index / readings.length <= densityThresholds.medium) {
      return "orange"; // Medium density
    } else {
      return "red"; // High density
    }
  };



const renderPotholeMarkers = (route) => {
  if (!directionsResponse) {
    return null;
  }

  const bounds = new window.google.maps.LatLngBounds();
  const potholeDensity = readings.length / route.overview_path.length;

  // Extend bounds with each point on the route
  route.legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      const path = step.path;
      path.forEach((point) => bounds.extend(point));
    });
  });

  return readings.map((location, index) => {
    // Check if location contains numerical values for lat and lng
    if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.error('Invalid location:', location);
      return null;
    }

    const potholeLatLng = new window.google.maps.LatLng(
      location.lat,
      location.lng
    );

    // Check if pothole is within the route bounds
    if (bounds.contains(potholeLatLng)) {
      const densityColor = getDensityColor(index, potholeDensity, route);

      return (
        <Circle
          key={index}
          center={location}
          radius={10} // Adjust the radius as needed
          options={{
            fillColor: densityColor,
            fillOpacity: 1,
            strokeWeight: 0,
          }}
        />
      );
    } else {
      return null; // Pothole is outside the route bounds
    }
  });
};

const renderPotholesWithinRoute = (route) => {
  if (!directionsResponse) {
    return null;
  }

  const bounds = new window.google.maps.LatLngBounds();
  const potholesWithinRoute = [];

  // Extend bounds with each point on the route
  route.legs.forEach((leg) => {
    leg.steps.forEach((step) => {
      const path = step.path;
      path.forEach((point) => bounds.extend(point));
    });
  });

  readings.forEach((location, index) => {
    // Check if location contains numerical values for lat and lng
    if (typeof location.lat === 'number' && typeof location.lng === 'number') {
      const potholeLatLng = new window.google.maps.LatLng(
        location.lat,
        location.lng
      );

      // Check if pothole is within the route bounds
      if (bounds.contains(potholeLatLng)) {
        potholesWithinRoute.push(location);
      }
    }
  });

  return potholesWithinRoute;
};


async function calculateRoute() {
  if (originRef.current.value === "" || destinationRef.current.value === "") {
    return;
  }

  try {
    // Reset previous search results
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    setButtonClicked(false);

    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true, // Ensure this is set to true
    });

    setResulting(results);
    console.log(resulting)
    

    console.log("API Results:", results); // Log the results to see if it contains multiple routes

    // Update state only if the component is still mounted
    if (map) {
      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);
      setButtonClicked(true);
    }
  } catch (error) {
    console.error("Error calculating route:", error);
  }
}

const handleNextRoute = () => {
  if (directionsResponse && currentRouteIndex < directionsResponse.routes.length - 1) {
    setCurrentRouteIndex(currentRouteIndex + 1);
  }
};

  

  function clearRoute() {
    console.log("clear routing")
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
    setButtonClicked(false);
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}

          
          {/* Add pothole markers to the map */}
          {buttonClicked && renderPotholeMarkers(directionsResponse.routes[0])}
{/* Add legend */}
<Legend />
          
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <HStack spacing={2} justifyContent="space-between">
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type="text" placeholder="Origin" ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
      <Button colorScheme="pink" type="submit" onClick={calculateRoute}>
        Calculate Route
      </Button>
      <Button colorScheme="pink" type="submit" onClick={handleNextRoute}>
        Next Route
      </Button>
      <Button colorScheme="pink" type="submit" onClick={handleGoback}>
        Go Back
      </Button>
      <IconButton
        aria-label="center back"
        icon={<FaTimes />}
        onClick={clearRoute}
      />
    </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <Text>No of potholes within route: {directionsResponse && directionsResponse.routes && renderPotholesWithinRoute(directionsResponse.routes[currentRouteIndex]).length}</Text>
          <Text>Routes : {resulting && resulting.length}</Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(center);
              map.setZoom(15);
            }}
          />
        </HStack>
      </Box>
    </Flex>
  );
}

export default Map;