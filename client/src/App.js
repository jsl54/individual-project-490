import React from 'react';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { 
  FiveMovies, 
  HomePage, 
  FiveActors, 
  FilmSearch,
  DisplayFilmDetails, 
  SearchFilmName} from './components/website';

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
        </Routes>
      </ChakraProvider>
    </Router>
  );
}


export default App;
