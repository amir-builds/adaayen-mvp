import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminWrapper from './pages/AdminWrapper';
import Navbar from './components/Navbar';

const App = () => (
	<BrowserRouter>
		<Navbar />
				<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/admin" element={<AdminWrapper />} />
			</Routes>
	</BrowserRouter>
);

export default App;
