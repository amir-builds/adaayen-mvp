import { useNavigate } from 'react-router-dom';

/**
 * useFabricNavigation — shared navigation hook for fabric/product cards.
 *
 * Returns a `navigateToFabric(fabric)` function that:
 *   1. Navigates to /shop/:id
 *   2. Passes the full fabric object as React Router navigation state so
 *      FabricDetail can render instantly without a network request.
 *
 * Usage:
 *   const { navigateToFabric } = useFabricNavigation();
 *   <div onClick={() => navigateToFabric(fabric)} />
 *
 * Note: scroll-position saving (sessionStorage) is handled by ShopFabrics
 * before calling this, because only that page needs to restore scroll on Back.
 * This hook handles only the shared navigate call.
 */
export function useFabricNavigation() {
  const navigate = useNavigate();

  const navigateToFabric = (fabric) => {
    const fabricId = fabric._id || fabric.id;
    navigate(`/shop/${fabricId}`, { state: { fabric } });
  };

  return { navigateToFabric };
}
