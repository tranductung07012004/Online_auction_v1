import { JSX, useState, useEffect } from 'react';
import Header from '../../components/header';
import ProfileSidebar from './profile/sidebar';
import { OrderCard, type OrderItem } from './profile/order-card';
import Footer from '../../components/footer';
import { useAuthStore } from '../../stores/authStore';
import { getUserProfile, UserProfileResponse } from '../../api/profileApi';
import { getUserOrders } from '../../api/order';
import { getCart, removeFromCart } from '../../api/cart';
import { toast } from 'react-hot-toast';

const mapOrderStatus = (backendStatus: string): 'pending' | 'paid' => {
  const status = backendStatus.toLowerCase();

  if (status === 'paid' || status === 'done' || status === 'delivered' || status === 'completed') {
    return 'paid';
  }

  return 'pending';
};

const USE_FAKE_DATA = true;

const generateFakeData = (showCurrent: boolean): OrderItem[] => {
  const fakeOrders: OrderItem[] = [];

  if (showCurrent) {
    
    fakeOrders.push(
      {
        id: 'fake-1',
        name: 'Tranh cua ba tuoc',
        image: '/pic1.jpg',
        size: 'M',
        color: 'Đỏ',
        rentalDuration: '3 Nights',
        arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'pending',
        purchaseType: 'rent',
        dressId: 'dress-1',
        
        seller: { id: 1, avatar: '/avt1.jpg', fullname: 'Nguyễn Văn An' },
        current_price: 2500000,
        buy_now_price: 3500000,
        highest_bidder: { id: 2, avatar: '/avt2.jpg', fullname: 'Trần Thị Bình' },
        bid_count: 15,
        start_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-2',
        name: 'Trung khung long',
        image: '/pic2.jpg',
        size: 'S',
        color: 'Trắng',
        rentalDuration: '5 Nights',
        arrivalDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'pending',
        purchaseType: 'rent',
        dressId: 'dress-2',
        seller: { id: 3, avatar: '/avt3.jpg', fullname: 'Lê Thị Cúc' },
        current_price: 4500000,
        buy_now_price: 6000000,
        highest_bidder: { id: 4, avatar: '/avt1.jpg', fullname: 'Phạm Văn Đức' },
        bid_count: 28,
        start_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-3',
        name: 'Trung da dieu to nhat the gioi',
        image: '/pic3.jpg',
        size: 'L',
        color: 'Xanh dương',
        rentalDuration: '2 Nights',
        arrivalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'pending',
        purchaseType: 'rent',
        dressId: 'dress-3',
        seller: { id: 5, avatar: '/avt2.jpg', fullname: 'Hoàng Văn Em' },
        current_price: 1800000,
        buy_now_price: 2800000,
        highest_bidder: { id: 6, avatar: '/avt3.jpg', fullname: 'Vũ Thị Phương' },
        bid_count: 42,
        start_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-cart-1',
        name: 'Phu dieu ai cap',
        image: '/pic4.jpg',
        size: 'M',
        color: 'Đen',
        rentalDuration: '4 Nights',
        arrivalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'pending',
        isCartItem: true,
        purchaseType: 'rent',
        dressId: 'dress-4',
        seller: { id: 7, avatar: '/avt1.jpg', fullname: 'Đặng Văn Giang' },
        current_price: 3200000,
        buy_now_price: 4500000,
        highest_bidder: { id: 8, avatar: '/avt2.jpg', fullname: 'Bùi Thị Hoa' },
        bid_count: 19,
        start_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    );
  } else {
    
    fakeOrders.push(
      {
        id: 'fake-done-1',
        name: 'Phu dieu ai cap ',
        image: '/pic7.png',
        size: 'M',
        color: 'Vàng',
        rentalDuration: '3 Nights',
        arrivalDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'paid',
        isPaid: true,
        purchaseType: 'rent',
        dressId: 'dress-5',
        seller: { id: 13, avatar: '/avt1.jpg', fullname: 'Võ Thị Mai' },
        current_price: 2200000,
        buy_now_price: 3200000,
        highest_bidder: { id: 14, avatar: '/avt2.jpg', fullname: 'Lý Văn Nam' },
        bid_count: 35,
        start_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-delivered-1',
        name: 'Chiec vay cua hoang hau elizabeth',
        image: '/pic8.png',
        size: 'S',
        color: 'Hồng',
        rentalDuration: '5 Nights',
        arrivalDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'paid',
        isPaid: true,
        purchaseType: 'rent',
        dressId: 'dress-6',
        seller: { id: 15, avatar: '/avt3.jpg', fullname: 'Phan Văn Oanh' },
        current_price: 4800000,
        buy_now_price: 6500000,
        highest_bidder: { id: 16, avatar: '/avt1.jpg', fullname: 'Đỗ Thị Phượng' },
        bid_count: 52,
        start_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-returned-1',
        name: 'Manh vo cua con tau titanic',
        image: '/pic9.png',
        size: 'L',
        color: 'Tím',
        rentalDuration: '2 Nights',
        arrivalDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'paid',
        isPaid: true,
        purchaseType: 'rent',
        dressId: 'dress-7',
        seller: { id: 17, avatar: '/avt2.jpg', fullname: 'Bùi Văn Quân' },
        current_price: 1900000,
        buy_now_price: 2900000,
        highest_bidder: { id: 18, avatar: '/avt3.jpg', fullname: 'Hồ Thị Rồng' },
        bid_count: 24,
        start_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-buy-1',
        name: 'thanh guom cua de tam de che',
        image: '/pic10.png',
        size: 'M',
        color: 'Xanh lá',
        rentalDuration: 'N/A',
        arrivalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: 'N/A',
        status: 'paid',
        isPaid: true,
        purchaseType: 'buy',
        dressId: 'dress-8',
        seller: { id: 19, avatar: '/avt1.jpg', fullname: 'Ngô Văn Sơn' },
        current_price: 5500000,
        buy_now_price: 5500000,
        highest_bidder: null,
        bid_count: 0,
        start_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'fake-done-2',
        name: 'Chien su o the chien thu hai',
        image: '/pic12.png',
        size: 'L',
        color: 'Bạc',
        rentalDuration: '4 Nights',
        arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'paid',
        isPaid: true,
        purchaseType: 'rent',
        dressId: 'dress-9',
        seller: { id: 22, avatar: '/avt1.jpg', fullname: 'Đinh Văn Uyên' },
        current_price: 3800000,
        buy_now_price: 5200000,
        highest_bidder: { id: 23, avatar: '/avt2.jpg', fullname: 'Lưu Thị Vân' },
        bid_count: 67,
        start_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        end_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
    );
  }

  return fakeOrders;
};

export default function OrderHistory(): JSX.Element {
  const [showCurrentOrders, setShowCurrentOrders] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserProfileResponse | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      console.log('========= ORDER HISTORY DEBUG =========');
      console.log('Show current orders:', showCurrentOrders);
      console.log('Using fake data:', USE_FAKE_DATA);
      
      setLoading(true);
      try {
        
        if (USE_FAKE_DATA) {
          console.log('Using fake data for UI preview');
          const fakeData = generateFakeData(showCurrentOrders);
          setOrders(fakeData);
          setLoading(false);
          return;
        }

        const ordersData = await getUserOrders();
        console.log('Raw orders data from API:', ordersData ? ordersData.length : 0, 'items');

        const formattedOrders: OrderItem[] = [];

        if (ordersData && ordersData.length > 0) {
          ordersData.forEach((order) => {
            
            if (!order.items || order.items.length === 0) {
              return;
            }

            const mappedStatus = mapOrderStatus(order.status);

            if (showCurrentOrders && order.status.toLowerCase() === 'paid') {
              return; 
            }
            if (!showCurrentOrders && order.status.toLowerCase() !== 'paid') {
              return; 
            }

            order.items.forEach((item, itemIndex) => {
              formattedOrders.push({
                id: `${order._id}-item-${itemIndex}`, 
                orderId: order._id, 
                orderIndex: itemIndex, 
                itemCount: order.items.length, 
                name: item.name,
                image: item.image,
                size: item.size,
                color: item.color,
                purchaseType: item.purchaseType || 'rent',
                dressId: item.dressId || item.dress?._id || item._id, 
                rentalDuration:
                  order.startDate && order.endDate
                    ? `${Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))} Nights`
                    : 'N/A',
                arrivalDate: order.arrivalDate
                  ? new Date(order.arrivalDate).toLocaleDateString()
                  : order.startDate
                    ? new Date(order.startDate).toLocaleDateString()
                    : 'N/A',
                returnDate: order.returnDate
                  ? new Date(order.returnDate).toLocaleDateString()
                  : order.endDate
                  ? new Date(order.endDate).toLocaleDateString()
                  : 'N/A',
                status: mappedStatus,
                isPaid: order.status.toLowerCase() === 'paid',
              });
            });
          });
        }

        if (showCurrentOrders) {
          
          try {
            console.log('Attempting to fetch dress cart items...');
            
            const cartResponse = await getCart();
            console.log('Full cart response:', JSON.stringify(cartResponse, null, 2));

            let cartItems = [];
            
            if (cartResponse && cartResponse.items && Array.isArray(cartResponse.items)) {
              
              cartItems = cartResponse.items;
              console.log('Found items array in cart response with', cartItems.length, 'items');
            } else if (cartResponse && Array.isArray(cartResponse)) {
              
              cartItems = cartResponse;
              console.log('Cart response is direct array with', cartItems.length, 'items');
            } else if (cartResponse && cartResponse.data && cartResponse.data.items && Array.isArray(cartResponse.data.items)) {
              
              cartItems = cartResponse.data.items;
              console.log('Found items in nested data structure with', cartItems.length, 'items');
            } else {
              console.log('Cart structure not recognized:', typeof cartResponse);
            }
            
            console.log('Cart items to process:', cartItems.length);
            
            if (cartItems.length > 0) {
              
              cartItems.forEach((item, index) => {
                console.log(`Processing dress cart item ${index}:`, item);

                const itemId = item._id || `index-${index}`;
                console.log(`Item ID for cart item ${index}:`, itemId);

                const name = item.name || 'Unnamed Item';
                const image = item.image || '/placeholder-dress.jpg';
                const size = item.size || 'Standard';
                const color = item.color || 'Default';
                
                formattedOrders.push({
                  id: `dress-cart-item-${itemId}`,
                  name,
                  image,
                  size,
                  color,
                  dressId: item.dressId || item.dress?._id || item._id, 
                  rentalDuration: item.startDate && item.endDate
                    ? `${Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / (1000 * 60 * 60 * 24))} Nights`
                    : 'N/A',
                  arrivalDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A',
                  returnDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A',
                  status: 'pending',
                  isCartItem: true,
                  purchaseType: item.purchaseType || 'rent'
                });
                
                console.log(`Added dress cart item ${index} to formatted orders`);
              });
            } else {
              console.log('No dress cart items found or empty array');
            }
          } catch (cartErr) {
            console.error('Error fetching dress cart items:', cartErr);
            console.error('Error details:', cartErr instanceof Error ? cartErr.message : String(cartErr));
          }
        }

        console.log('Total formatted orders before deduplication:', formattedOrders.length);

        const uniqueOrderMap = new Map();
        formattedOrders.forEach((order) => {
          if (order.isCartItem) {
            
            const key = `${order.name}-${order.size}-${order.color}`;
            if (
              !uniqueOrderMap.has(key) ||
              (uniqueOrderMap.get(key).isCartItem && !order.isCartItem)
            ) {
              uniqueOrderMap.set(key, order);
            }
          } else {
            
            const key = order.id;
            uniqueOrderMap.set(key, order);
          }
        });

        const deduplicatedOrders = Array.from(uniqueOrderMap.values());
        console.log('Deduplicated orders count:', deduplicatedOrders.length);

        setOrders(deduplicatedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, showCurrentOrders]);

  const filteredOrders = orders.filter((order) => {
    if (showCurrentOrders) {
      
      return order.status === 'pending' || order.isCartItem === true;
    } else {
      
      return order.status === 'paid' || order.isPaid === true;
    }
  });

  console.log('Final filtered orders count:', filteredOrders.length);
  console.log('Show current orders:', showCurrentOrders);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      console.log('Handling delete for order ID:', orderId);
      setLoading(true);

      if (orderId.startsWith('dress-cart-item-')) {
        
        const idParts = orderId.split('-');
        const itemIndex = parseInt(idParts[idParts.length - 1]);
        
        console.log('Attempting to delete dress cart item at index:', itemIndex);
        console.log('ID parts:', idParts);
        
        if (!isNaN(itemIndex)) {
          console.log('Using removeFromCart with index:', itemIndex);
          
          await removeFromCart(itemIndex);

          toast.success('Dress removed from cart successfully');

          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } else {
          console.error('Invalid item index:', itemIndex, 'from ID:', orderId);
          toast.error('Invalid item index');
        }
      } else {
        console.log('Unknown order ID format:', orderId);
      }
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      console.error('Error details:', err instanceof Error ? err.message : String(err));
      toast.error(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab="order-history"
              userName={userData ? userData.email : 'User'}
              userImage={userData?.avatar}
              fullName={userData?.fullname}
              assessment={userData?.assessment}
            />
          </div>

          <div className="md:col-span-2">
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onDelete={undefined}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <p className="text-gray-500">
                    No {showCurrentOrders ? 'current' : 'previous'} orders found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
