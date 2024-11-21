
new Vue({
    el: '#app',
    data: {
        sitename: 'Online Learning Hub',
        searchTerm: '',
        sortBy: 'title',
        sortOrder: 'asc',
        subjects: [],
        cart: [],
        checkoutDetails: {
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            shipAsGift: false,
            deliveryMethod: ''
        },
        showCartPage: false,
        showCheckoutForm: false,
        showSummary: false
    },
    computed: {
        filteredSubjects() {
            let filtered = this.subjects.filter(subject => {
                return (
                    subject.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    subject.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                    subject.price.toString().includes(this.searchTerm) ||
                    subject.spaces.toString().includes(this.searchTerm)
                );
            });

            filtered.sort((a, b) => {
                const key = this.sortBy;
                if (this.sortOrder === 'asc') return a[key] > b[key] ? 1 : -1;
                return a[key] < b[key] ? 1 : -1;
            });

            return filtered;
        }
    },

    
    methods: {
        canAddToCart(subject) {
            return subject.spaces > 0;
        },
        isOutOfStock(subject) {
            return subject.spaces === 0;
        },
        addToCart(subject) {
            if (this.canAddToCart(subject)) {
                this.cart.push({ ...subject });
                subject.spaces--; // Reduce available spaces.
            }
        },
        removeFromCart(subject, index) {
            this.cart.splice(index, 1); // Remove from cart.
            // Add space back to the original subject in the list.
            const originalSubject = this.subjects.find(s => s._id === subject._id);
            if (originalSubject) {
                originalSubject.spaces++;
            }
        },
        viewCart() {
            this.showCartPage = !this.showCartPage; // Toggle cart view.
        },
        // Check if a product can be added to the cart
        canAddToCart(subject) {
            return subject.spaces > this.cartCount(subject._id);
        },

        // Count the number of a specific product in the cart
        cartCount(id) {
            return this.cart.filter(item => item._id === id).length;
        }, 
        goBackToProducts() {
            this.showCartPage = false;
        },
        goToCheckout() {
            this.showCheckoutForm = true;
        },
        goBackToCart() {
            this.showCheckoutForm = false;
        },
        submitCheckoutForm() {
            this.showSummary = true;
            this.showCheckoutForm = false;
        },
        goBackToCheckout() {
            this.showSummary = false;
            this.showCheckoutForm = true;
        },
        completeCheckout() {
            alert('Thank you for your order!');
            this.cart = [];
            this.showSummary = false;
        },
        fetchProducts() {
            // Fetch products from the backend API
            fetch('https://cw1-fullstack-backend.onrender.com/collections/subjects')
                .then(response => response.json())
                .then(data => {
                    this.subjects = data;
                })
                .catch(error => {
                    console.error('Error fetching products:', error);
                });
            
    },
    addToCart(subject) {
        if (subject.spaces > 0) {
            fetch(`https://cw1-fullstack-backend.onrender.com/collections/subjects/${subject._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spaces: subject.spaces - 1 })
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to update spaces');
                this.cart.push(subject);
                subject.spaces--;
            })
            .catch(error => {
                console.error('Error updating lesson spaces:', error);
                alert('Failed to add to cart.');
            });
        }
    },
    completeCheckout() {
        const orderDetails = {
            ...this.checkoutDetails,
            items: this.cart,
            total: this.cart.reduce((total, item) => total + item.price, 0)
        };

        fetch('https://cw1-fullstack-backend.onrender.com/collections/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetails)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save order');
            return response.json();
        })
        .then(() => {
            alert('Thank you for your order!');
            this.cart = [];
            this.showSummary = false;
            this.fetchProducts();
        })
        .catch(error => {
            console.error('Error completing order:', error);
            alert('Failed to complete order.');
        });
    },
    viewCart() { this.showCartPage = true; },
    goBackToProducts() { this.showCartPage = false; },
    goToCheckout() { this.showCheckoutForm = true; },
    goBackToCart() { this.showCheckoutForm = false; },
    goBackToCheckout() { this.showSummary = false; this.showCheckoutForm = true; }
    },
    mounted() {
        this.fetchProducts();
    }
});