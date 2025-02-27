import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ProductionScheduler from './schedule';
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <TikTokOrderDashboard />;
      case 'scheduler':
        return <ProductionScheduler />;
      default:
        return <TikTokOrderDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-4 items-center">
              <Button 
                variant={currentPage === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setCurrentPage('dashboard')}
              >
                Order Dashboard
              </Button>
              <Button 
                variant={currentPage === 'scheduler' ? 'default' : 'outline'}
                onClick={() => setCurrentPage('scheduler')}
              >
                Production Scheduler
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
};

const TikTokOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [skuStats, setSkuStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [productTypeStats, setProductTypeStats] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    totalSales: 0,
    totalTaxes: 0,
    totalShipping: 0,
    averageOrderValue: 0,
  });
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [jsonError, setJsonError] = useState(null);
  const [piecesRequired, setPiecesRequired] = useState([]);
  const [pieceColorFilter, setPieceColorFilter] = useState('all');
  
  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    minItems: '',
    maxItems: '',
    minValue: '',
    maxValue: '',
    dateRange: 'all',
    productCategory: 'all',
    productType: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'];
  const categoryColors = { 'Cup': '#2563eb', 'Other': '#f59e0b' };
  const typeColors = { 'Owala': '#ec4899', 'Stanley': '#10b981', 'Other': '#6b7280' };

  // Function to categorize SKUs
  const categorizeSkuName = (skuName) => {
    if (skuName === 'Default') {
      return {
        category: 'Other',
        productType: 'Keychain',
        display: 'Animal Keychain'
      };
    }
    
    if (skuName.includes('Body')) {
      return {
        category: 'Cup',
        productType: 'Owala',
        display: `Owala ${skuName.replace(' Body', '')}`
      };
    }
    
    if (['Green', 'Blue', 'Multi-Color', 'Gradient'].includes(skuName)) {
      return {
        category: 'Cup',
        productType: 'Stanley',
        display: `Stanley ${skuName}`
      };
    }
    
    // Default case for any unmatched SKUs
    return {
      category: 'Other',
      productType: 'Other',
      display: skuName
    };
  };

  const getPiecesRequired = (skuName) => {
    // Only process Owala cups
    if (!skuName.includes('Body')) {
      return [];
    }
    
    // Map of pieces required for each Owala cup type
    const piecesMap = {
      'Purple Body': [
        { name: 'Purple Bottle', type: 'Bottle' },
        { name: 'Magenta Lid', type: 'Lid' },
        { name: 'Yellow Handle', type: 'Handle' },
        { name: 'Blue Ring', type: 'Ring' },
        { name: 'Orange Button', type: 'Button' }
      ],
      'White Body': [
        { name: 'White Bottle', type: 'Bottle' },
        { name: 'Gray Lid', type: 'Lid' },
        { name: 'White Handle', type: 'Handle' },
        { name: 'Black Button', type: 'Button' },
        { name: 'Black Ring', type: 'Ring' }
      ],
      'Pink Body': [
        { name: 'Pink Bottle', type: 'Bottle' },
        { name: 'Purple Lid', type: 'Lid' },
        { name: 'Yellow Handle', type: 'Handle' },
        { name: 'Yellow Ring', type: 'Ring' },
        { name: 'White Button', type: 'Button' }
      ],
      'Orange Body': [
        { name: 'Orange Bottle', type: 'Bottle' },
        { name: 'Gray Lid', type: 'Lid' },
        { name: 'Brown Handle', type: 'Handle' },
        { name: 'White Ring', type: 'Ring' },
        { name: 'Orange Button', type: 'Button' }
      ],
      'Lime/Neon Green Body': [
        { name: 'Lime Green Bottle', type: 'Bottle' },
        { name: 'Blue Lid', type: 'Lid' },
        { name: 'Green Handle', type: 'Handle' },
        { name: 'Mint Green Ring', type: 'Ring' },
        { name: 'Mint Green Button', type: 'Button' }
      ],
      'Light Green Body': [
        { name: 'Mint Green Bottle', type: 'Bottle' },
        { name: 'Pink Lid', type: 'Lid' },
        { name: 'White Handle', type: 'Handle' },
        { name: 'Yellow Ring', type: 'Ring' },
        { name: 'Brown Button', type: 'Button' }
      ]
    };
    
    // Return the pieces array for the specified SKU or an empty array if not found
    return piecesMap[skuName] || [];
  };
  const extractColorFromPieceName = (pieceName) => {
    // Extract the color by taking everything before the piece type
    const words = pieceName.split(' ');
    if (words.length < 2) return 'Unknown';
    
    // The color is everything except the last word (which is the piece type)
    return words.slice(0, words.length - 1).join(' ');
  };
  
  // Add this function to get all unique colors
  const getAllPieceColors = () => {
    const colors = new Set();
    
    piecesRequired.forEach(piece => {
      const color = extractColorFromPieceName(piece.name);
      colors.add(color);
    });
    
    return Array.from(colors).sort();
  };
  
  // Add this handler for the color filter
  const handlePieceColorFilterChange = (color) => {
    setPieceColorFilter(color);
  };
  
  // Add this function to filter pieces by color
  const getFilteredPieces = () => {
    if (pieceColorFilter === 'all') {
      return piecesRequired;
    }
    
    return piecesRequired.filter(piece => {
      const pieceColor = extractColorFromPieceName(piece.name);
      return pieceColor === pieceColorFilter;
    });
  };

  const processJsonData = (jsonData) => {
    setJsonError(null);
    
    try {
      let data;
      // Handle either string or object input
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }
      
      if (!data || !data.data || !data.data.main_orders) {
        throw new Error('Invalid JSON format: missing main_orders array');
      }
      
      // Get the mainOrders array
      const mainOrders = data.data.main_orders;
      
      // Check for duplicates before adding
      const currentOrderIds = new Set(orders.map(order => order.main_order_id));
      
      // Filter out orders that are already in the state
      const uniqueNewOrders = mainOrders.filter(order => !currentOrderIds.has(order.main_order_id));
      
      // Update orders state
      const updatedOrders = [...orders, ...uniqueNewOrders];
      setOrders(updatedOrders);
      
      // Process SKU quantities
      processSkuStats(updatedOrders);
      
      // Process financial data
      processFinancialStats(updatedOrders);
      
      // Process order statuses
      processOrderStatuses(updatedOrders);
    } catch (error) {
      console.error('Error processing JSON data:', error);
      setJsonError(error.message);
    }
  };

  const processSkuStats = (orderData) => {
    // Initialize objects to hold stats
    const skuQuantities = {};
    const categoryQuantities = {};
    const productTypeQuantities = {};
    
    // Loop through all orders
    orderData.forEach(order => {
      // Check if sku_module exists
      if (order.sku_module && Array.isArray(order.sku_module)) {
        // Loop through all SKUs in this order
        order.sku_module.forEach(sku => {
          const skuName = sku.sku_name;
          const quantity = sku.quantity || 1;
          
          // Categorize the SKU
          const { category, productType } = categorizeSkuName(skuName);
          
          // Add to the running total for this SKU
          if (skuQuantities[skuName]) {
            skuQuantities[skuName] += quantity;
          } else {
            skuQuantities[skuName] = quantity;
          }
          
          // Add to category stats
          if (categoryQuantities[category]) {
            categoryQuantities[category] += quantity;
          } else {
            categoryQuantities[category] = quantity;
          }
          
          // Add to product type stats
          if (productTypeQuantities[productType]) {
            productTypeQuantities[productType] += quantity;
          } else {
            productTypeQuantities[productType] = quantity;
          }
        });
      }
    });
    
    // Convert the objects to arrays for chart display
    const skuStatsArray = Object.keys(skuQuantities).map(name => ({
      name,
      quantity: skuQuantities[name],
      ...categorizeSkuName(name)
    }));
    
    const categoryStatsArray = Object.keys(categoryQuantities).map(category => ({
      name: category,
      quantity: categoryQuantities[category]
    }));
    
    const productTypeStatsArray = Object.keys(productTypeQuantities).map(type => ({
      name: type,
      quantity: productTypeQuantities[type]
    }));
    
    // Sort by quantity desc
    skuStatsArray.sort((a, b) => b.quantity - a.quantity);
    categoryStatsArray.sort((a, b) => b.quantity - a.quantity);
    productTypeStatsArray.sort((a, b) => b.quantity - a.quantity);
    
    setSkuStats(skuStatsArray);
    setCategoryStats(categoryStatsArray);
    setProductTypeStats(productTypeStatsArray);
    const piecesRequiredMap = {};

// Loop through all SKUs to count pieces needed
skuStatsArray.forEach(sku => {
  if (sku.productType === 'Owala') {
    const pieces = getPiecesRequired(sku.name);
    pieces.forEach(piece => {
      // Multiply by the quantity of this SKU
      
      const pieceQuantity = sku.quantity;
      
      if (piecesRequiredMap[piece.name]) {
        piecesRequiredMap[piece.name] += pieceQuantity;
      } else {
        piecesRequiredMap[piece.name] = pieceQuantity;
      }
    });
  }
});
const piecesRequiredArray = Object.keys(piecesRequiredMap).map(name => {
  // Extract piece type from name (e.g., "Blue Ring" -> "Ring")
  const type = name.split(' ').pop();
  
  return {
    name,
    type,
    quantity: piecesRequiredMap[name]
  };
});

// Group by type for better organization
const groupedByType = piecesRequiredArray.reduce((acc, piece) => {
  if (!acc[piece.type]) {
    acc[piece.type] = [];
  }
  
  acc[piece.type].push(piece);
  return acc;
}, {});

setPiecesRequired(piecesRequiredArray);
  };

  const processFinancialStats = (orderData) => {
    let totalSales = 0;
    let totalTaxes = 0;
    let totalShipping = 0;
    
    orderData.forEach(order => {
      if (order.price_module) {
        // Add grand total
        if (order.price_module.grand_total && order.price_module.grand_total.price_val) {
          totalSales += parseFloat(order.price_module.grand_total.price_val);
        }
        
        // Add taxes
        if (order.price_module.taxes && order.price_module.taxes.price_val) {
          totalTaxes += parseFloat(order.price_module.taxes.price_val);
        }
        
        // Add shipping
        if (order.price_module.shipping_origin_fee && order.price_module.shipping_origin_fee.price_val) {
          totalShipping += parseFloat(order.price_module.shipping_origin_fee.price_val);
        }
      }
    });
    
    // Calculate average order value
    const averageOrderValue = orderData.length > 0 ? totalSales / orderData.length : 0;
    
    setFinancialStats({
      totalSales,
      totalTaxes,
      totalShipping,
      averageOrderValue
    });
  };

  const processOrderStatuses = (orderData) => {
    const statusCounts = {};
    
    orderData.forEach(order => {
      if (order.order_status_module && Array.isArray(order.order_status_module)) {
        order.order_status_module.forEach(statusItem => {
          const status = getStatusName(statusItem.main_order_status);
          
          if (statusCounts[status]) {
            statusCounts[status]++;
          } else {
            statusCounts[status] = 1;
          }
        });
      }
    });
    
    const statusArray = Object.keys(statusCounts).map(status => ({
      name: status,
      count: statusCounts[status]
    }));
    
    setOrderStatuses(statusArray);
  };

  // Helper function to convert status codes to readable names
  const getStatusName = (statusCode) => {
    const statusMap = {
      101: 'Awaiting Shipment',
      102: 'Shipped',
      103: 'Delivered',
      104: 'Completed',
      105: 'Cancelled',
      // Add more status codes as needed
    };
    
    return statusMap[statusCode] || `Status ${statusCode}`;
  };

  const handleJsonPaste = (e) => {
    const pastedText = e.target.value;
    if (!pastedText) return;
    
    try {
      const jsonData = JSON.parse(pastedText);
      processJsonData(jsonData);
      e.target.value = ''; // Clear the textarea
    } catch (error) {
      setJsonError('Invalid JSON format. Please check your data and try again.');
    }
  };

  const handleClearData = () => {
    setOrders([]);
    setSkuStats([]);
    setCategoryStats([]);
    setProductTypeStats([]);
    setFinancialStats({
      totalSales: 0,
      totalTaxes: 0,
      totalShipping: 0,
      averageOrderValue: 0,
    });
    setOrderStatuses([]);
    setJsonError(null);
    setSearchTerm('');
    setSortConfig({ key: 'date', direction: 'desc' });
    setFilters({
      status: 'all',
      minItems: '',
      maxItems: '',
      minValue: '',
      maxValue: '',
      dateRange: 'all',
      productCategory: 'all',
      productType: 'all'
    });
    setCurrentPage(1);
  };
  
  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Apply filters, search, and sorting to orders
  useEffect(() => {
    // Start with all orders
    let result = [...orders];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(order => 
        order.main_order_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(order => {
        const firstStatusModule = order.order_status_module && order.order_status_module[0];
        return firstStatusModule && 
          getStatusName(firstStatusModule.main_order_status).toLowerCase() === filters.status.toLowerCase();
      });
    }
    
    if (filters.minItems) {
      result = result.filter(order => {
        const itemsCount = order.sku_module
          ? order.sku_module.reduce((total, sku) => total + (sku.quantity || 1), 0)
          : 0;
        return itemsCount >= parseInt(filters.minItems);
      });
    }
    
    if (filters.maxItems) {
      result = result.filter(order => {
        const itemsCount = order.sku_module
          ? order.sku_module.reduce((total, sku) => total + (sku.quantity || 1), 0)
          : 0;
        return itemsCount <= parseInt(filters.maxItems);
      });
    }
    
    if (filters.minValue) {
      result = result.filter(order => {
        const orderValue = order.price_module && order.price_module.grand_total
          ? parseFloat(order.price_module.grand_total.price_val || 0)
          : 0;
        return orderValue >= parseFloat(filters.minValue);
      });
    }
    
    if (filters.maxValue) {
      result = result.filter(order => {
        const orderValue = order.price_module && order.price_module.grand_total
          ? parseFloat(order.price_module.grand_total.price_val || 0)
          : 0;
        return orderValue <= parseFloat(filters.maxValue);
      });
    }
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (filters.dateRange === 'today') {
        cutoffDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (filters.dateRange === 'week') {
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
      } else if (filters.dateRange === 'month') {
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      
      result = result.filter(order => {
        const orderDate = order.trade_order_module && order.trade_order_module.create_time
          ? new Date(parseInt(order.trade_order_module.create_time) * 1000)
          : null;
        return orderDate && orderDate >= cutoffDate;
      });
    }
    
    // Filter by product category
    if (filters.productCategory !== 'all') {
      result = result.filter(order => {
        if (!order.sku_module) return false;
        
        // Check if any SKU in the order matches the category filter
        return order.sku_module.some(sku => {
          const { category } = categorizeSkuName(sku.sku_name);
          return category === filters.productCategory;
        });
      });
    }
    
    // Filter by product type
    if (filters.productType !== 'all') {
      result = result.filter(order => {
        if (!order.sku_module) return false;
        
        // Check if any SKU in the order matches the type filter
        return order.sku_module.some(sku => {
          const { productType } = categorizeSkuName(sku.sku_name);
          return productType === filters.productType;
        });
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = a.trade_order_module && a.trade_order_module.create_time
          ? parseInt(a.trade_order_module.create_time)
          : 0;
        const dateB = b.trade_order_module && b.trade_order_module.create_time
          ? parseInt(b.trade_order_module.create_time)
          : 0;
        
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortConfig.key === 'items') {
        const itemsA = a.sku_module
          ? a.sku_module.reduce((total, sku) => total + (sku.quantity || 1), 0)
          : 0;
        const itemsB = b.sku_module
          ? b.sku_module.reduce((total, sku) => total + (sku.quantity || 1), 0)
          : 0;
        
        return sortConfig.direction === 'asc' ? itemsA - itemsB : itemsB - itemsA;
      }
      
      if (sortConfig.key === 'total') {
        const totalA = a.price_module && a.price_module.grand_total
          ? parseFloat(a.price_module.grand_total.price_val || 0)
          : 0;
        const totalB = b.price_module && b.price_module.grand_total
          ? parseFloat(b.price_module.grand_total.price_val || 0)
          : 0;
        
        return sortConfig.direction === 'asc' ? totalA - totalB : totalB - totalA;
      }
      
      // Default sort by order ID
      return sortConfig.direction === 'asc' 
        ? a.main_order_id.localeCompare(b.main_order_id)
        : b.main_order_id.localeCompare(a.main_order_id);
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, sortConfig, filters]);

  // Get status options for filter dropdown
  const getStatusOptions = () => {
    const statusSet = new Set();
    
    orders.forEach(order => {
      if (order.order_status_module && Array.isArray(order.order_status_module)) {
        order.order_status_module.forEach(statusItem => {
          statusSet.add(getStatusName(statusItem.main_order_status));
        });
      }
    });
    
    return Array.from(statusSet);
  };
  
  // Get product categories for filter dropdown
  const getProductCategories = () => {
    return [...new Set(skuStats.map(item => item.category))];
  };
  
  // Get product types for filter dropdown
  const getProductTypes = () => {
    return [...new Set(skuStats.map(item => item.productType))];
  };
  
  // Get the count of cups vs other items
  const getCupsVsOtherCounts = () => {
    const cups = skuStats
      .filter(item => item.category === 'Cup')
      .reduce((total, item) => total + item.quantity, 0);
    
    const other = skuStats
      .filter(item => item.category !== 'Cup')
      .reduce((total, item) => total + item.quantity, 0);
    
    return {
      cups,
      other,
      totalItems: cups + other
    };
  };
  
  // Pagination
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Status badge color mapping
  const getStatusBadgeColor = (status) => {
    const statusMap = {
      'awaiting shipment': 'bg-yellow-100 text-yellow-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          {payload[0].payload.display && <p className="text-gray-500 text-sm">{payload[0].payload.display}</p>}
          {payload[0].payload.category && <p className="text-gray-500 text-sm">Category: {payload[0].payload.category}</p>}
          {payload[0].payload.productType && <p className="text-gray-500 text-sm">Type: {payload[0].payload.productType}</p>}
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">TikTok Shop Order Dashboard</h1>
            <button 
              onClick={handleClearData}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Clear Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* JSON Input Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-3">Import TikTok JSON Data</h2>
          <textarea 
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste your TikTok JSON data here..."
            onChange={handleJsonPaste}
          />
          {jsonError && (
            <div className="mt-2 text-sm text-red-600">
              {jsonError}
            </div>
          )}
          <div className="mt-2 text-sm text-gray-500">
            Import data by pasting the JSON response from TikTok Shop network request.
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Orders</div>
            <div className="mt-1 text-3xl font-semibold">{orders.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Sales</div>
            <div className="mt-1 text-3xl font-semibold">${financialStats.totalSales.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Average Order Value</div>
            <div className="mt-1 text-3xl font-semibold">${financialStats.averageOrderValue.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Items</div>
            <div className="mt-1 text-3xl font-semibold">
              {skuStats.reduce((total, sku) => total + sku.quantity, 0)}
            </div>
          </div>
        </div>

        {/* Product Category Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cup vs Other Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Product Categories</h2>
            <div className="h-80">
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {categoryStats.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={categoryColors[entry.name] || colors[0]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No category data available
                </div>
              )}
            </div>
          </div>
          
          {/* Product Type Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Product Types</h2>
            <div className="h-80">
              {productTypeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productTypeStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {productTypeStats.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={typeColors[entry.name] || colors[0]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No product type data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SKU Quantities Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">SKU Quantities</h2>
            <div className="h-80">
              {skuStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skuStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="quantity" name="Quantity">
                      {skuStats.map((entry) => {
                        const color = entry.category === 'Cup' 
                          ? (entry.productType === 'Owala' ? typeColors.Owala : typeColors.Stanley)
                          : categoryColors.Other;
                        return <Cell key={`cell-${entry.name}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No SKU data available
                </div>
              )}
            </div>
          </div>
          
          {/* Order Status Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Order Statuses</h2>
            <div className="h-80">
              {orderStatuses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatuses}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {orderStatuses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No status data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SKU Quantity Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">SKU Quantities</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skuStats.map((sku, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                          backgroundColor: sku.category === 'Cup' 
                            ? (sku.productType === 'Owala' ? typeColors.Owala : typeColors.Stanley)
                            : categoryColors.Other 
                        }}></div>
                        <div className="text-sm font-medium text-gray-900">{sku.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sku.productType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sku.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sku.quantity}
                    </td>
                  </tr>
                ))}
                {skuStats.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No SKU data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

       {/* Pieces Required for Owala Cups */}
<div className="bg-white rounded-lg shadow overflow-hidden mb-6">
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-lg font-medium">Pieces Required for Owala Cups</h2>
  </div>
  
  {/* Add Color Filter */}
  <div className="px-6 py-3 border-b border-gray-200">
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-700 mr-3">Filter by Color:</span>
      <select 
        value={pieceColorFilter}
        onChange={(e) => handlePieceColorFilterChange(e.target.value)}
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="all">All Colors</option>
        {getAllPieceColors().map(color => (
          <option key={color} value={color}>{color}</option>
        ))}
      </select>
    </div>
  </div>
  
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Piece Name
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Color
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantity Needed
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {getFilteredPieces().sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)).map((piece, index) => {
          const pieceColor = extractColorFromPieceName(piece.name);
          return (
            <tr key={piece.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">{piece.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {pieceColor}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                  {piece.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {piece.quantity}
              </td>
            </tr>
          );
        })}
        {piecesRequired.length === 0 && (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
              No Owala cups ordered yet
            </td>
          </tr>
        )}
        {piecesRequired.length > 0 && getFilteredPieces().length === 0 && (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
              No pieces match the selected color filter
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Order Management</h2>
          </div>
          
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  {getStatusOptions().map(status => (
                    <option key={status} value={status.toLowerCase()}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items:</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minItems}
                    onChange={(e) => handleFilterChange('minItems', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxItems}
                    onChange={(e) => handleFilterChange('maxItems', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value ($):</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range:</label>
                <select 
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              
              {/* Add Product Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Category:</label>
                <select 
                  value={filters.productCategory}
                  onChange={(e) => handleFilterChange('productCategory', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {getProductCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Add Product Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type:</label>
                <select 
                  value={filters.productType}
                  onChange={(e) => handleFilterChange('productType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {getProductTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
                  >
                    Order ID
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
                    onClick={() => requestSort('date')}
                  >
                    Date
                    {sortConfig.key === 'date' && (
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
                    onClick={() => requestSort('items')}
                  >
                    Items
                    {sortConfig.key === 'items' && (
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
                    onClick={() => requestSort('total')}
                  >
                    Total
                    {sortConfig.key === 'total' && (
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Products
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order, index) => {
                  // Get order date
                  const orderDate = order.trade_order_module && order.trade_order_module.create_time
                    ? new Date(parseInt(order.trade_order_module.create_time) * 1000).toLocaleDateString()
                    : 'N/A';
                  
                  // Get items count
                  const itemsCount = order.sku_module
                    ? order.sku_module.reduce((total, sku) => total + (sku.quantity || 1), 0)
                    : 0;
                  
                  // Get order status
                  const firstStatusModule = order.order_status_module && order.order_status_module[0];
                  const status = firstStatusModule 
                    ? getStatusName(firstStatusModule.main_order_status)
                    : 'Unknown';
                  
                  // Get order total
                  const total = order.price_module && order.price_module.grand_total
                    ? order.price_module.grand_total.format_price || `${order.price_module.grand_total.price_val}`
                    : 'N/A';
                  
                  // Get SKU details for this order
                  const skuDetails = order.sku_module ? order.sku_module.map(sku => {
                    const { category, productType, display } = categorizeSkuName(sku.sku_name);
                    return {
                      name: sku.sku_name,
                      quantity: sku.quantity || 1,
                      category,
                      productType,
                      display
                    };
                  }) : [];
                  
                  
                  // Get unique product categories and types in this order
                  const orderCategories = [...new Set(skuDetails.map(sku => sku.category))];
                  const orderTypes = [...new Set(skuDetails.map(sku => sku.productType))];
                  
                  return (
                    <tr key={order.main_order_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">
                        {order.main_order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {itemsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {/* Show product categories */}
                          <div className="flex flex-wrap gap-1">
                            {orderCategories.map(category => (
                              <span key={category} 
                                className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{ backgroundColor: categoryColors[category] || '#6b7280', color: 'white' }}
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                          
                          {/* Show product types */}
                          <div className="flex flex-wrap gap-1">
                            {orderTypes.map(type => (
                              <span key={type} 
                                className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{ backgroundColor: typeColors[type] || '#6b7280', color: 'white' }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {orders.length === 0 ? 'No orders available' : 'No orders match your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <span className="text-sm text-gray-700">Items per page:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="flex items-center justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    &laquo;
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    &lt;
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    &gt;
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    &raquo;
                  </button>
                </nav>
              </div>
              
              <div className="text-sm text-gray-700 mt-4 sm:mt-0">
                Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to <span className="font-medium">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of <span className="font-medium">{filteredOrders.length}</span> orders
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white shadow-sm mt-6 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            TikTok Shop Dashboard - Product Categories: Cup (Owala, Stanley) and Other (Animal Keychain)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;