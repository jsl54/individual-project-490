// import necessary libraries
import React, {useState, useEffect} from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { Center, Text, Heading, Box, HStack, Flex, Button, Input, Td, Tr, Tbody, Table, Th, Thead } from "@chakra-ui/react";
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
          <Route path="/ViewCustomerDetails" element={<ViewCustomerDetails />} />
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
            <NavLink to="/ViewCustomerDetails">View Customers</NavLink>
          </Flex>
        </Flex>
      </div>
    </>
  );
}

// Displays each and every customer in the database
const ViewCustomerDetails = () => {
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
  const [fullName, setFullName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/displayFilmDetails/${film_id}`)
      .then(response => {
        setDetails(response.data.film_details);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [film_id]);

  const handleRent = () => {
    setShowNameInput(true); 
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Renting film ${film_id} for ${fullName}`);
  };

  return (
    <div>
      <Box>
        <Center bg="blue" h="70px" color="black">
          <Heading as="h1">Film Details</Heading>
        </Center>
      </Box>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {details.map(d => (
          <li key={d.title} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h2 style={{ marginBottom: '8px', color: '#333' }}>{d.title}</h2>
            <p><strong>Description:</strong> {d.description}</p>
            <p><strong>Release Year:</strong> {d.release_year}</p>
            <p><strong>Category:</strong> {d.category_name}</p>
            <p><strong>Length:</strong> {d.length} minutes</p>
            <p><strong>Rating:</strong> {d.rating}</p>
            <p><strong>Special Features:</strong> {d.special_features}</p>
            <p><strong>Rental Duration:</strong> {d.rental_duration} days</p>
            <p><strong>Rental Rate:</strong> ${d.rental_rate}</p>
            <p><strong>Total Available:</strong> {d.total_available}</p>
          </li>
        ))}
      </ul>
      {!showNameInput && (
        <Button
          variant="outline"
          colorScheme="black"
          bg={"blue.500"}
          textColor={"white"}
          size="md"
          ml='10px'
          my='-5px'
          onClick={handleRent} 
        >
          Rent
        </Button>
      )}
      {showNameInput && (
        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your name"
            size="sm" 
            style={{ padding: '8px', marginLeft: '10px', width: '15%', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <Button
            variant="outline"
            colorScheme="black"
            bg={"blue.500"}
            textColor={"white"}
            size="md"
            ml='10px'
            my='5px'
            type="submit"
          >
            Confirm Rental
          </Button>
        </form>
      )}
    </div>
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