import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Box,
  Container,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  Grid,
  GridItem,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { FiSearch, FiMapPin, FiGlobe, FiWifi } from 'react-icons/fi';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchLocationData = async (ip) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      if (response.data.error) {
        throw new Error(response.data.reason || 'Invalid IP address');
      }
      setLocationData(response.data);
      setIpAddress(response.data.ip);
      toast({
        title: 'Success',
        description: 'Location data retrieved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Error fetching location data. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLocationData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load user's IP address on component mount
  useEffect(() => {
    fetchLocationData('');  // Empty string will return the user's own IP
  }, []);

  const handleSearch = () => {
    if (!ipAddress) {
      toast({
        title: 'Error',
        description: 'Please enter an IP address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    fetchLocationData(ipAddress);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="6xl">
        <VStack spacing={8}>
          <Heading size="xl" color="blue.600">
            <Icon as={FiMapPin} mr={2} />
            IP Address Location Finder
          </Heading>

          <Card w="full" variant="elevated">
            <CardBody>
              <Grid templateColumns="1fr auto" gap={4}>
                <Input
                  placeholder="Enter IP Address (e.g., 8.8.8.8)"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="lg"
                />
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loading}
                  leftIcon={<FiSearch />}
                >
                  Search
                </Button>
              </Grid>
            </CardBody>
          </Card>

          {locationData && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              <Card>
                <CardHeader>
                  <Heading size="md">
                    <Icon as={FiGlobe} mr={2} />
                    Location Details
                  </Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>IP Address</StatLabel>
                      <StatNumber fontSize="md">{locationData.ip}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>City</StatLabel>
                      <StatNumber fontSize="md">{locationData.city}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Region</StatLabel>
                      <StatNumber fontSize="md">{locationData.region}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Country</StatLabel>
                      <StatNumber fontSize="md">{locationData.country_name}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Postal</StatLabel>
                      <StatNumber fontSize="md">{locationData.postal || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Timezone</StatLabel>
                      <StatNumber fontSize="md">{locationData.timezone}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">
                    <Icon as={FiWifi} mr={2} />
                    Network Information
                  </Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>ISP</StatLabel>
                      <StatNumber fontSize="md">{locationData.org}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>ASN</StatLabel>
                      <StatNumber fontSize="md">{locationData.asn || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Latitude</StatLabel>
                      <StatNumber fontSize="md">{locationData.latitude}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Longitude</StatLabel>
                      <StatNumber fontSize="md">{locationData.longitude}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {locationData.latitude && locationData.longitude && (
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Card>
                    <CardHeader>
                      <Heading size="md">Location Map</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box h="400px" w="full" borderRadius="lg" overflow="hidden">
                        <MapContainer
                          center={[locationData.latitude, locationData.longitude]}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[locationData.latitude, locationData.longitude]}>
                            <Popup>
                              <Text fontWeight="bold">{locationData.city}, {locationData.country_name}</Text>
                              <Text fontSize="sm">{locationData.org}</Text>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </Box>
                    </CardBody>
                  </Card>
                </GridItem>
              )}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default App;