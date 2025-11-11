import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './pages/About';
import Home from './pages/Home';
import AdminWrapper from './pages/AdminWrapper';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Creators from './pages/Creators';
import CreatorProfile from './pages/CreatorProfile';
import CreatorDashboard from './pages/CreatorDashboard';
import Cart from './pages/Cart';
import ShopFabrics from './pages/ShopFabrics';
import Navbar from './components/Navbar';

const App = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/creators" element={<Creators />} />
      <Route path="/creators/:id" element={<CreatorProfile />} />
      <Route path="/creator/dashboard" element={<CreatorDashboard />} />
      <Route path="/admin" element={<AdminWrapper />} />
      <Route path="/about" element={<About />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/shop" element={<ShopFabrics />} />
    </Routes>
  </BrowserRouter>
);

export default App;
