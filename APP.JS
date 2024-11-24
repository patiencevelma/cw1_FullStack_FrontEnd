let app = new Vue({
    // Bind Vue instance to the element with id `#app`
    el: '#app',

    // Define reactive data properties for the app
    data: {
        sitename: 'Online Learning Hub', // Application name
        searchTerm: '', // Search input for filtering subjects
        sortBy: 'title', // Sorting criteria (default: title)
        sortOrder: 'asc', // Sorting order (default: ascending)
        subjects: [], // Array to hold the list of subjects
        cart: [], // Array to store items added to the cart
        checkoutDetails: { // Object to store checkout form details
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            shipAsGift: false, // Checkbox for shipping as a gift
            deliveryMethod: '' // Selected delivery method
        },
        showCartPage: false, // Toggle visibility of cart page
        showCheckoutForm: false, // Toggle visibility of checkout form
        showSummary: false // Toggle visibility of checkout summary
    },

    // Define computed properties for reactive data transformations
    computed: {
        filteredSubjects() {
            // Ensure `subjects` is an array; return empty if not
            if (!Array.isArray(this.subjects)) return []; 

            // Filter subjects based on `searchTerm` matching various fields
            let filtered = this.subjects.filter(subject => {
                if (!subject) return false; // Skip null/undefined subjects

                return (
                    (subject.title?.toLowerCase() || '').includes(this.searchTerm.toLowerCase()) ||
                    (subject.location?.toLowerCase() || '').includes(this.searchTerm.toLowerCase()) ||
                    (subject.price?.toString() || '').includes(this.searchTerm) ||
                    (subject.spaces?.toString() || '').includes(this.searchTerm)
                );
            });

            // Sort the filtered subjects based on `sortBy` and `sortOrder`
            filtered.sort((a, b) => {
                const key = this.sortBy;
                const aKey = a[key] || '';
                const bKey = b[key] || '';

                // Ascending or descending sort logic
                if (this.sortOrder === 'asc') return aKey > bKey ? 1 : -1;
                return aKey < bKey ? 1 : -1;
            });

            return filtered; // Return sorted and filtered array
        }
    },

    // Define methods for handling user actions and backend interactions
    methods: {
        addToCart(subject) {
            // Add subject to cart if spaces are available
            if (subject.spaces > 0) {
                subject.spaces--; // Decrease available spaces
                this.cart.push(subject); // Add to cart
            }
        },
        removeFromCart(subject, index) {
            // Remove subject from cart and restore available space
            subject.spaces++;
            this.cart.splice(index, 1);
        },
        toggleviewCart() {
            // Toggle visibility of the cart page
            this.showCartPage = !this.showCartPage;
        },
        goToCheckout() {
            // Show checkout form and hide cart page
            this.showCheckoutForm = true;
            this.showCartPage = false;
        },
        goBackToCart() {
            // Show cart page and hide checkout form
            this.showCheckoutForm = false;
            this.showCartPage = true;
        },
        submitCheckoutForm() {
            // Show summary page and hide checkout form
            this.showSummary = true;
            this.showCheckoutForm = false;
        },
        goBackToCheckout() {
            // Show checkout form and hide summary page
            this.showSummary = false;
            this.showCheckoutForm = true;
        },
        completeCheckout() {
            // Prepare order details for submission
            const orderDetails = {
                ...this.checkoutDetails,
                items: this.cart, // Include cart items
                total: this.cart.reduce((total, item) => total + item.price, 0) // Calculate total price
            };

            // Send order details to backend
            fetch('https://cw1-fullstack-backend.onrender.com/collections/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save order'); // Handle error
                }
                return response.json();
            })
            .then(data => {
                console.log('Order successfully saved with ID:', data.id); // Log success
                alert('Thank you for your order!');
                this.cart = []; // Clear the cart
                this.showSummary = false; // Hide summary
                this.fetchProducts(); // Refresh product list
            })
            .catch(error => {
                console.error('Error completing order:', error); // Log error
                alert('Failed to complete order.');
            });
        },
        viewCart() { 
            // Show the cart page
            this.showCartPage = true; 
        },
        goBackToProducts() { 
            // Return to product list view
            this.showCartPage = false; 
        },
        fetchProducts() {
            // Fetch products from backend API
            fetch('https://cw1-fullstack-backend.onrender.com/collections/subjects')
                .then(response => response.json())
                .then(data => {
                    // Ensure fetched data is an array of valid objects
                    this.subjects = Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : [];
                })
                .catch(error => {
                    console.error('Error fetching products:', error); // Log error
                });
        },
        updateCartInBackend(subject) {
            // Update subject spaces on backend before adding to cart
            if (subject.spaces > 0) {
                fetch(`https://cw1-fullstack-backend.onrender.com/collections/subjects/${subject._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ spaces: subject.spaces - 1 }) // Decrease spaces
                })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to update spaces'); // Handle error
                    this.cart.push(subject); // Add to cart
                    subject.spaces--; // Decrease local spaces count
                })
                .catch(error => {
                    console.error('Error updating lesson spaces:', error); // Log error
                    alert('Failed to add to cart.');
                });
            }
        }
    },

    // Lifecycle hook: fetch products when app is mounted
    mounted() {
        this.fetchProducts();
    }
});
