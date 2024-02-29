// import necessary libraries
import React, {useState, useEffect} from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { Center, Text, Heading, Box, HStack, Flex, Button, Input, Td, Tr, Tbody, Table, Th, Thead, FormControl, Alert, FormLabel,
AlertIcon, VStack } from "@chakra-ui/react";
import { FaTimes, FaCheck } from 'react-icons/fa';
import axios from 'axios';

// defines app component, creates paths to different components with app.js once a button is clicked or an action is done
function App() {
  return (
    <Router>
      <ChakraProvider>
        <Routes>
          <Route path="/FilmSearch" element={<FilmSearch />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/FiveActors" element={<FiveActors />} />
          <Route path="/FiveMovies" element={<FiveMovies />} />
          <Route path="/displayFilmDetails/:film_id" element={<DisplayFilmDetails />} />
          <Route path="/SearchFilmName" element={<SearchFilmName />} />
          <Route path="/displayActorDetails/:actor_id" element={<DisplayActorDetails />} />
          <Route path="/SearchFilmGenre" element={<SearchFilmGenre />} />
          <Route path="/SearchFilmActor" element={<SearchFilmActor />} />
          <Route path="/ViewCustomerList" element={<ViewCustomerList />} />
          <Route path="/AddCustomer" element={<AddCustomer />} />
          <Route path="/DeleteCustomer" element={<DeleteCustomer />} />
          <Route path ="/EditCustomer" element={<EditCustomer />} />
          <Route path="/ViewCustomerDetails" element={<ViewCustomerDetails />} />
          <Route path="/SearchCustomer" element={<SearchCustomer />} />
          <Route path="/ReturnMovie" element={<ReturnMovie />} />
        </Routes>
      </ChakraProvider>
    </Router>
  );
}

// Homepage navigation button structure
const NavLink = ({ to, children }) => {
  return (
    <Link to={to}>
      <Box as='button' borderRadius='md' my='20px' bg="cyan.500" ml="56px" blockSize={10} width="90%">
        <Text my="4px" fontSize={20} color="black">
          {children}
        </Text>
      </Box>
    </Link>
  );
};

// Displays the default path (the homepage)
const HomePage = () => {
  return (
    <>
      <div>
        <Center bg="blue" h="70px" color="black">
          <header>
            <Heading>Home Page</Heading>
          </header>
        </Center>
      </div>
      <div>
        <HStack>
          <Box w="50%" bg="purple" ml="45px">
            <Text my="5px" ml="47%" fontSize={20} color="white">
              Movies
            </Text>
          </Box>
          <Box w="50%" bg="purple" ml="40px" mr='30px'>
            <Text my="5px" ml="47%" fontSize={20} color="white">
              Customers
            </Text>
          </Box>
        </HStack>
        <Flex flexDirection="row">
          <Flex flexDirection="column" mr={4} w ="48%" ml="5px">
            <NavLink to="/FiveMovies">Top 5 Rented Movies Of All Time</NavLink>
            <NavLink to="/FiveActors">Top 5 Actors By Number of Films</NavLink>
            <NavLink to="/FilmSearch">Film Search</NavLink>
          </Flex>
          <Flex flexDirection="column" w="48%">
            <NavLink to="/ViewCustomerList">View List of Customers</NavLink>
            <NavLink to="/AddCustomer">Add Customers</NavLink>
            <NavLink to="/EditCustomer">Edit Customer Details</NavLink>
            <NavLink to="/DeleteCustomer">Delete Customer</NavLink>
            <NavLink to="/ViewCustomerDetails">View Customer Details</NavLink>
            <NavLink to="/SearchCustomer">Search Customer</NavLink>
            <NavLink to="/ReturnMovie">Return Movie</NavLink>
          </Flex>
        </Flex>
      </div>
    </>
  );
}

const ReturnMovie = () => {
  const [rentalId, setRentalId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleReturn = () => {
    // Reset error and success messages
    setErrorMessage('');
    setSuccessMessage('');
  
    // Make API call to return the movie
    axios.post(`http://localhost:5000/returnMovie/${rentalId}`)
      .then(response => {
        setSuccessMessage(response.data.message);
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          setErrorMessage('No rental ID found');
        } else if (error.response && error.response.status === 400 && error.response.data.error === 'Movie has already been returned') {
          setErrorMessage('Movie has already been returned');
        } else if (error.response && error.response.data && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage('An unknown error occurred');
        }
      });
  };

  return (
    <Box>
      <Center bg="blue" h="70px" color="black">
        <header>
          <Heading>Return A Movie</Heading>
        </header>
      </Center>
      <Box ml='20px' my='20px' mr="85%">
        <Input
          type="text"
          placeholder="Enter rental ID"
          value={rentalId}
          onChange={(e) => setRentalId(e.target.value)}
        />
        <Button
          variant="outline"
          colorScheme="black"
          size="lg"
          m="2"
          onClick={handleReturn}
        >
          Return Movie
        </Button>
      </Box>
      {errorMessage && <Box ml='20px' color="red">{errorMessage}</Box>}
      {successMessage && <Box ml='20px' color="green">{successMessage}</Box>}
    </Box>
  );
};

// View a customer's details if they have present and past rentals
const ViewCustomerDetails = () => {
  const navigate = useNavigate(); 
  const [searchInput, setSearchInput] = useState(''); // State to hold input value for customer ID search
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error message if search fails
  const [customerDetails, setCustomerDetails] = useState(null); // State to hold customer details from backend
  const [searched, setSearched] = useState(false); // State to track if search has been performed

  // Function to handle customer search
  const handleSearch = () => {
    axios.get(`http://localhost:5000/viewCustomerDetails/${searchInput}`)
      .then(response => {
        const customer = response.data.customer;
        setCustomerDetails(customer); 
        setErrorMessage(''); // Clear error message
        setSearched(true); 
      })
      .catch(error => {
        setCustomerDetails(null); 
        setErrorMessage('Error searching for customer.');
        console.error('Error searching for customer:', error); 
        setSearched(true);
      });
  };

  // UI and output management
  return (
    <>
      <Center bg="blue" h="70px" color="black">
        <header>
          <Heading>View Customer Details</Heading>
        </header>
      </Center>
      <Box ml='20px' my='20px' mr="85%">
        <Input
          type="text"
          placeholder="Enter customer ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button
          variant="outline"
          colorScheme="black"
          size="lg"
          m="2"
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>
      <Box ml='20px' color="red">
        {errorMessage && <div>{errorMessage}</div>}
      </Box>
      {customerDetails && customerDetails.length > 0 ? (
        <Box ml='20px' mt='20px'>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{customerDetails[0].first_name} {customerDetails[0].last_name}</Td>
              </Tr>
            </Tbody>
          </Table>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Email</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{customerDetails[0].email}</Td>
              </Tr>
            </Tbody>
          </Table>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Store ID</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{customerDetails[0].store_id}</Td>
              </Tr>
            </Tbody>
          </Table>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Purchased Movies</Th>
                <Th>Return Date</Th>
              </Tr>
            </Thead>
            <Tbody>
            {customerDetails.map((customer, index) => (
              <Tr key={index}>
                <Td>{customer.title}</Td>
                { /* If movie is not returned, print N/A */ }
                <Td>{customer.return_date ? new Date(customer.return_date).toLocaleDateString() : "N/A"}</Td>  
              </Tr>
            ))}
            </Tbody>
          </Table>
        </Box>
      ) : searched && (!customerDetails || customerDetails.length === 0) ? (
        // If no rentals found for customer, display this
        <Box ml='20px' mt='20px'>No rentals found for this customer.</Box>
      ) : null}
    </>
  );
};

// Search for a customer based on their customer id, first name, or last name. Uses a regex type search
const SearchCustomer = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResult, setSearchResult] = useState([]);

  // handle searching for a customer upon entry of their id or their name
  const handleSearch = () => {
    axios.get('http://localhost:5000/searchCustomer', { params: { searchInput } })
      .then(response => {
        const customers = response.data.customers;
        setSearchResult(customers);
      })
      .catch(error => {
        setErrorMessage('Error searching for customers.');
        console.error('Error searching for customers:', error);
      });
  };

  // UI for searching for a customer in the database
  return (
    <>
      <Center bg="blue" h="70px" color="black">
        <header>
          <Heading>Search Customer</Heading>
        </header>
      </Center>
      <Box ml='20px' my='20px' mr="85%">
        <Input
          type="text"
          placeholder="Enter customer or ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button
          variant="outline"
          colorScheme="black"
          size="lg"
          m="2"
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>
      <Box ml='20px' color="red">
        {errorMessage && <div>{errorMessage}</div>}
      </Box>
      <Box ml='20px' mt='20px'>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Id</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Store Id</Th>
              <Th>Address Id</Th>
            </Tr>
          </Thead>
          <Tbody>
            {searchResult.map(customer => (
              <Tr key={customer.customer_id}>
                <Td>{customer.customer_id}</Td>
                <Td>{customer.first_name} {customer.last_name}</Td>
                <Td>{customer.email}</Td>
                <Td>{customer.store_id}</Td>
                <Td>{customer.address_id}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

// Adds a customer to the database
const AddCustomer = () => {
  const [customerAdded, setCustomerAdded] = useState(false);
  const [formData, setFormData] = useState({
    store_id: '',
    first_name: '',
    last_name: '',
    email: '',
    address_id: ''
  });
  const [error, setError] = useState('');

  // Update form data upon user entering the data requested
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset error message if user starts entering proper fields
    if (error && formData[e.target.name] !== '') {
      setError('');
    }
  };

  // Upon entering the necessary data, add the customer. If an error occurs, display error message to the user
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/addCustomer', formData)
      .then(response => {
        setCustomerAdded(true);
      })
      .catch(error => {
        setError('Error adding customer. Improper fields entered, please try again');
      });
  };

  // UI, displays text fields, request form data, and handles error message and success message
  return (
    <div>
      <Center bg="blue" h="70px" color="black">
        <Heading>Add Customer</Heading>
      </Center>
      <Box p="4">
        <form onSubmit={handleSubmit}>
          <FormControl mb="4">
            <FormLabel>Store ID</FormLabel>
            <Input
              type="text"
              name="store_id"
              placeholder="Enter store ID"
              value={formData.store_id}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb="4">
            <FormLabel>First Name</FormLabel>
            <Input
              type="text"
              name="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb="4">
            <FormLabel>Last Name</FormLabel>
            <Input
              type="text"
              name="last_name"
              placeholder="Enter last name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb="4">
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb="4">
            <FormLabel>Address ID</FormLabel>
            <Input
              type="text"
              name="address_id"
              placeholder="Enter address ID"
              value={formData.address_id}
              onChange={handleChange}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">Add Customer</Button>
        </form>
        {error && (
          <Alert mt="4" status="error">
            <AlertIcon as={FaTimes} />
            {error}
          </Alert>
        )}
        {customerAdded && (
          <Alert mt="4" status="success">
            <AlertIcon as={FaCheck} />
            Customer added successfully
          </Alert>
        )}
      </Box>
    </div>
  );
};

// Edit a customer in the database
const EditCustomer = () => {
  // State variables for form data management
  const [customerId, setCustomerId] = useState(''); 
  const [formData, setFormData] = useState({ 
    firstName: '',
    lastName: '',
    email: '',
    addressId: '',
  });
  const [editSuccess, setEditSuccess] = useState(false); 
  const [editMessage, setEditMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Based on input fields entered, update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle form submission and send info to endpoint
  const handleSubmit = async () => {
    setIsLoading(true); 
    try {
      const response = await axios.patch(`http://localhost:5000/editCustomer/${customerId}`, formData);
      setEditSuccess(true);
      setEditMessage(response.data.message);
    } catch (error) {
      console.error('Error editing customer:', error);
      setEditSuccess(false);
      setEditMessage('An error occurred while editing the customer.');
    }
    setIsLoading(false);   // Changing loading status to false upon success
  };

  // UI design for form data and page
  return (
    <Box>
      <Center bg="blue" h="70px" color="black">
        <Heading>Edit Customer</Heading>
      </Center>
      <FormControl ml={'5px'} width={'50%'} id="customerId" isRequired mb={4}>
        <FormLabel>Customer ID</FormLabel>
        <Input type="text" name="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
      </FormControl>
      <FormControl ml={'5px'} width={'50%'} id="firstName">
        <FormLabel>First Name</FormLabel>
        <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
      </FormControl>
      <FormControl ml={'5px'} width={'50%'} id="lastName">
        <FormLabel>Last Name</FormLabel>
        <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
      </FormControl>
      <FormControl ml={'5px'} width={'50%'} id="email">
        <FormLabel>Email</FormLabel>
        <Input type="email" name="email" value={formData.email} onChange={handleChange} />
      </FormControl>
      <FormControl ml={'5px'} width={'50%'} id="addressId">
        <FormLabel>Address ID</FormLabel>
        <Input type="text" name="addressId" value={formData.addressId} onChange={handleChange} />
      </FormControl>
      <Button
        colorScheme="blue"
        size="lg"
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Submitting"
        isDisabled={!customerId} 
        ml={'5px'}
        my={'10px'}
      >
        Edit Customer
      </Button>
      {editMessage && (
        <Alert mt={4} status={editSuccess ? 'success' : 'error'}>
          <AlertIcon />
          {editMessage}
        </Alert>
      )}
    </Box>
  );
};

// Delete a customer from the database
const DeleteCustomer = () => {
  const { customer_id } = useParams();
  const [inputId, setInputId] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // use post to modify the database in MySQL
  useEffect(() => {
    axios.post(`http://localhost:5000/deleteCustomer/${customer_id}`)
      .then(response => {
        setDeleteMessage(response.data.message);
      })
      .catch(error => {
        console.error('Error deleting data:', error);
      });
  }, []);

  // Check if the customer ID exists. If not, display a message to the user. If successful, display a "success" to the user
  const handleDeleteCustomer = () => {
    axios.delete(`http://localhost:5000/deleteCustomer/${inputId}`)
      .then(response => {
        setDeleteSuccess(true);
        setDeleteMessage(response.data.message);
      })
      .catch(error => {
        if (error.response.status === 404) {
          setDeleteSuccess(false);
          setDeleteMessage('Could not delete. There is no customer with that ID.');
        } else {
          console.error('Error deleting customer:', error);
        }
      });
  };


  // UI, includes text boxes as well as displaying the appropriate message to the user
  return (
    <div>
      <Center bg="blue" h="70px" color="black">
        <Heading>Delete Customer</Heading>
      </Center>
      <Box mt="20px" mx="auto" maxW="400px">
        <Input
          type="text"
          placeholder="Enter Customer ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <Button
          mt="4"
          colorScheme="red"
          onClick={handleDeleteCustomer}
        >
          Delete Customer
        </Button>
        {deleteMessage && (
          <Alert mt="4" status={deleteSuccess ? 'success' : 'error'}>
            <AlertIcon 
            // If true, display check icon. Else, display X icon
            as={deleteSuccess ? FaCheck : FaTimes} />      
            {deleteMessage}
          </Alert>
        )}
      </Box>
    </div>
  );
};

// Displays each and every customer in the database
const ViewCustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(40); // Display the number of customers per page

  // grabs the customer information from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/viewCustomers');
        setCustomers(response.data.customers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Grabs the current customers based on the page
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  //Change the page after clicking
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Display the customer information and stylize output
  return (
    <Box>
      <Center bg="blue" h="70px" color="black">
        <Heading as="h1">Customer Details</Heading>
      </Center>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Customer_id</Th>
            <Th>Name</Th>
            <Th>Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentCustomers.map(customer => (
            <Tr key={customer.customer_id}>
              <Td>{customer.customer_id}</Td>
              <Td>{customer.first_name} {customer.last_name}</Td>
              <Td>{customer.email}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <HStack spacing={2} mt={4}>
        {Array.from({ length: Math.ceil(customers.length / customersPerPage) }).map((_, index) => (
          <Button ml={'10px'} key={index} onClick={() => paginate(index + 1)} colorScheme={currentPage === index + 1 ? "blue" : "gray"}>
            {index + 1}
          </Button>
        ))}
      </HStack>
    </Box>
  );
};


// Displays the top 5 rented movies to the user once the button is clicked. Once a movie is clicked on, it redirects to /displayFilmDetails
// where it searches by film_id and displays the film information
const FiveMovies = () => {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/topFiveFilms')
      .then(response => {
        setFilms(response.data.film);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <Box>
      <Center bg="blue" h="70px" color="black">
        <Heading as="h1">Top 5 Rented Movies</Heading>
      </Center>
      <Box p="3" size="5" mt="4" display="flex" flexDirection="column" alignItems="center">
        {films.map((film) => (
          <Link to={`/displayFilmDetails/${film.film_id}`} key={film.film_id}>
            <Button
              variant="outline"
              size="lg"
              bgColor={'cyan.500'}
              m="4"
            >
              {film.title}
            </Button>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

// Displays the search selection when user clicks on Film Search
const FilmSearch = () => {
  return (
      <>
          <div>
              <Center bg="blue" h="70px" color="black">
                  <header>
                      <Heading>Film Search</Heading>
                  </header>
              </Center>
              <Flex ml='25%' flexDirection="column" w="48%" my='15px'>
                <NavLink to="/SearchFilmName">Search By Film Name</NavLink>
                <NavLink to="/SearchFilmActor">Search Film By Actors</NavLink>
                <NavLink to="/SearchFilmGenre">Search By Genre</NavLink>
              </Flex>
          </div>
      </>
  )
};

// component to display the page for the top 5 actors by the number of films
const FiveActors = () => {
  return (
      <>
          <div>
              <Center bg="blue" h="70px" color="black">
                  <header>
                      <Heading>Top 5 Actors By Number of Films</Heading>
                  </header>
              </Center>
                < FiveActorsList />
          </div>
      </>
  )
}

// Displays the names of the top 5 actors by the number of films they were in
const FiveActorsList = () => {
  const [actor, setActors] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/topFiveActors') // grabs the data from flask api location specified
      .then(response => {
        setActors(response.data.actor);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // return the list of top 5 actors
  return (
    <div>
      <ul>
        <Box p="3" size="5" mt="4" display="flex" flexDirection="column" alignItems="center">
          {actor.map(actors => (
            <Link to={`/displayActorDetails/${actors.actor_id}`}>
              <Button
                variant="outline"
                size="lg"
                bgColor={'cyan.500'}
                m="4"
              >
                {actors.first_name}
                {' '}
                {actors.last_name}
              </Button>
            </Link>
          ))}
        </Box>
      </ul>
    </div>
  );
};

const DisplayActorDetails = () => {
  const { actor_id } = useParams();
  const [actor_details, setDetails] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/displayActorDetails/${actor_id}`)
      .then(response => {
        setDetails(response.data.actor_details);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [actor_id]);

  return (
    <div>
      <Box>
        <Center bg="blue" h="70px" color="black">
          <Heading as="h1">Actor Details (Top 5 Rented Movies)</Heading>
        </Center>
      </Box>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {actor_details.map(ad => (
            <>
              <li key={ad.film_title} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '15px', marginTop:'20px'}}>
                <p><strong>Actor:</strong> {ad.first_name}{' '}{ad.last_name}</p>
                <p><strong>Film:</strong> {ad.film_title}</p>
                <p><strong>Description:</strong> {ad.description}</p>
                <p><strong>Release Year:</strong> {ad.release_year}</p>
                <p><strong>Category:</strong> {ad.category}</p>
                <p><strong>Movie Length:</strong> {ad.length} minutes</p>
                <p><strong>Rating:</strong> {ad.rating}</p>
              </li>
              <Button
                variant="outline"
                colorScheme="black"
                bg={"blue.500"}
                textColor={"white"}
                size="md"
                ml='10px'
                my='-10px'
              >
                Rent
              </Button>
            </>
          ))}
        </ul>
    </div>
  );
};

// Fetches the information from flask to display the details of the movie
const DisplayFilmDetails = () => {
  const { film_id } = useParams();
  const [details, setDetails] = useState([]);
  const [isRenting, setIsRenting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/displayFilmDetails/${film_id}`)
      .then(response => {
        setDetails(response.data.film_details);
      })
      .catch(error => {
        console.error('Error fetching film details:', error);
        setError(error);
      });
  }, [film_id]);

  const rentFilm = () => {
    setIsRenting(true);
  };

  const confirmRental = (e) => {
    e.preventDefault();
    
    if (!fullName || !staffId) {
      setError('Please enter your customer ID and staff ID.');
      return;
    }
    
    if (details.length === 0) {
      setError('Film details are not available.');
      return;
    }
  
    const requestData = { 
      inventory_id: details[0].inventory_id, 
      customer_id: fullName, 
      staff_id: staffId 
    };
  
    axios.post('http://localhost:5000/addRental', requestData)
      .then(response => {
        setIsRenting(false);
        setSuccessMessage(response.data.message);
        setError(null); // Reset error state on success
      })
      .catch(error => {
        console.error('Error confirming rental:', error.response.data.error);
        setIsRenting(false);
        setError('An error occurred while confirming the rental.');
      });
  };

  return (
    <Box>
      <Center bg="blue" h="70px" color="black">
        <Heading>Film Details</Heading>
      </Center>
      <VStack align="flex-start" spacing={4} mt={8}>
        {details.map(d => (
          <Box key={d.title} borderWidth="1px" borderRadius="lg" p={4} w="100%">
            <Heading as="h2" size="md" mb={2}>{d.title}</Heading>
            <Text><strong>Description:</strong> {d.description}</Text>
            <Text><strong>Release Year:</strong> {d.release_year}</Text>
            <Text><strong>Category:</strong> {d.category_name}</Text>
            <Text><strong>Length:</strong> {d.length} minutes</Text>
            <Text><strong>Rating:</strong> {d.rating}</Text>
            <Text><strong>Special Features:</strong> {d.special_features}</Text>
            <Text><strong>Rental Duration:</strong> {d.rental_duration} days</Text>
            <Text><strong>Rental Rate:</strong> ${d.rental_rate}</Text>
            <Text><strong>Total Available:</strong> {d.total_available}</Text>
            {!isRenting ? (
              <Button mt={4} colorScheme="blue" onClick={rentFilm}>Rent Film</Button>
            ) : (
              <form onSubmit={confirmRental}>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your customer ID"
                  size="md"
                  mb={2}
                  width={'100%'}
                />
                <Input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter staff ID"
                  size="md"
                  mb={2}
                  width={'100%'}
                />
                <Button mt={2} colorScheme="blue" type="submit">Confirm Rental</Button>
              </form>
            )}
          </Box>
        ))}
      </VStack>
      {error && (
        <Text color="red.500" mt={4}>Error: {error}</Text>
      )}
      {successMessage && (
        <Text color="green.500" mt={4}>{successMessage}</Text>
      )}
    </Box>
  );
};


// displays 3 options to search: search by film name, actors, and genre
const SearchFilmName = () => {
  const navigate = useNavigate(); 
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    axios.get(`http://localhost:5000/searchByTitle/${searchInput}`)
      .then(response => {
        const films = response.data.film;
        console.log(response.data)
  
        if (films.length > 0) {
          const filmId = films[0].film_id;
          navigate(`/displayFilmDetails/${filmId}`) 
          setErrorMessage('');
        } else {
          setErrorMessage('Sorry, that movie was not found. Try a different movie');
          // Handle the case where no films are found
        }
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        setErrorMessage('An error occurred while searching for the movie.');
      });
    };

  return (
    <>
      <Center bg="blue" h="70px" color="black">
        <header>
          <Heading>Search By Film Name</Heading>
        </header>
      </Center>
      <Box ml='20px' my='20px' mr="85%">
        <Input
          type="text"
          placeholder="Enter film name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button
          variant="outline"
          colorScheme="black"
          size="lg"
          m="2"
          onClick={handleSearch}
        >
          Search
        </Button>
        </Box>
          <Box>
            {errorMessage && (
              <Box ml='20px' color="red">
                {errorMessage}
              </Box>
      )}
      </Box>
    </>
  );
};

const SearchFilmGenre = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [films, setFilms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    axios.get(`http://localhost:5000/searchByCategory/${searchInput}`)
    .then(response => {
      const categoryFilms = response.data.category;
      console.log(response.data)

      if (categoryFilms.length > 0) {
        setFilms(categoryFilms); 
        setErrorMessage(''); // Clear error message
      } else {
        setFilms([]);
        setErrorMessage('Sorry, that film category was not found. Try a different category');
      }
    })
    .catch(error => {
      console.error('Error fetching search results:', error);
      setFilms([]); 
      setErrorMessage('An error occurred while searching for the movie.');
    });
};

  const handleFilmClick = (filmId) => {
    navigate(`/displayFilmDetails/${filmId}`);
  };

  return (
    <>
      <Center bg="blue" h="70px" color="black">
        <header>
          <Heading>Search By Category Name</Heading>
        </header>
      </Center>
      <Box ml='20px' my='20px' mr="85%">
        <Input
          type="text"
          placeholder="Enter category"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button
          variant="outline"
          colorScheme="black"
          size="lg"
          m="2"
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>
      <Box>
        {errorMessage && (
          <Box ml='20px' color="red">
            {errorMessage}
          </Box>
        )}
      </Box>
      <Flex ml='20px' my='20px' flexDirection="column">
        {films.map(film => (
          <Box
            key={film.film_id}
            bg="cyan.500"
            color="black"
            p="4"
            m="2"
            borderRadius="md"
            textAlign="center" 
            onClick={() => handleFilmClick(film.film_id)}
            cursor="pointer"
          >
            {film.title}
          </Box>
        ))}
      </Flex>
    </>
  );
};

const SearchFilmActor = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [films, setFilms] = useState([]); 
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = () => {
    axios.get(`http://localhost:5000/searchByActor/${searchInput}`)
      .then(response => {
        const actorFilms = response.data.name; 
        console.log(response.data);

        if (actorFilms.length > 0) {
          setFilms(actorFilms); 
          setErrorMessage(''); // Clear error message
        } else {
          setFilms([]);
          setErrorMessage('Sorry, no films found for that actor. Try a different name.');
        }
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        setFilms([]); 
        setErrorMessage('An error occurred while searching for the movies.');
      });
  };

  const handleFilmClick = (filmId) => {
    navigate(`/displayFilmDetails/${filmId}`);
  };

  return (
    <>
      <Center bg="blue" h="70px" color="black">
        <header>
          <Heading>Search By Actor Name</Heading>
        </header>
      </Center>
      <Box ml='20px' my='20px' mr="85%">
        <Input
          type="text"
          placeholder="Enter actor"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button
          variant="outline"
          colorScheme="black"
          size="lg"
          m="2"
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>
      <Box>
        {errorMessage && (
          <Box ml='20px' color="red">
            {errorMessage}
          </Box>
        )}
      </Box>
      <Flex ml='20px' my='20px' flexDirection="column">
        {films.map(film => (
          <Box
            key={film.film_id}
            bg="cyan.500"
            color="black"
            p="4"
            m="2"
            borderRadius="md"
            textAlign="center" 
            onClick={() => handleFilmClick(film.film_id)}
            cursor="pointer"
          >
            {film.title}
          </Box>
        ))}
      </Flex>
    </>
  );
};

export default App;