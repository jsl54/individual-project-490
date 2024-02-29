from flask import request, Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:A!19lopej135@localhost/sakila'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

class Film(db.Model):
    __tablename__ = 'film'
    film_id = db.Column(db.SmallInteger, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(5000))
    release_year = db.Column(db.Integer)
    length = db.Column(db.SmallInteger)
    rating = db.Column(db.Enum('G', 'PG', 'PG-13', 'R', 'NC-17'))
    special_features = db.Column(db.String(100))
    rental_duration = db.Column(db.SmallInteger, nullable=False)
    rental_rate = db.Column(db.DECIMAL(4, 2), nullable=False)

class Rental(db.Model):
    __tablename__ = "rental"
    rental_id = db.Column(db.SmallInteger, primary_key=True)
    rental_date = db.Column(db.String(30))
    inventory_id = db.Column(db.Integer)
    customer_id = db.Column(db.Integer)
    return_date = db.Column(db.String(30))
    staff_id = db.Column(db.SmallInteger)
    
class Inventory(db.Model):
    __tablename__ = 'inventory'
    inventory_id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.SmallInteger)
    store_id = db.Column(db.SmallInteger)
    
class Actor(db.Model):
    __tablename__ = 'actor'
    actor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45))
    last_name = db.Column(db.String(45))

class Customer(db.Model):
    __tablename__ = 'customer'
    customer_id = db.Column(db.Integer, primary_key=True, autoincrement= True)
    store_id = db.Column(db.Integer)
    first_name = db.Column(db.String(45))
    last_name = db.Column(db.String(45))
    email = db.Column(db.String(100))
    address_id = db.Column(db.Integer)
    active = db.Column(db.Integer)
    create_date = db.Column(db.String(30))

@app.route('/returnMovie/<int:rental_id>', methods=['POST'])
def returnMovie(rental_id):
    rental = db.session.get(Rental, rental_id)

    if not rental:
        return jsonify({'error': 'Rental not found'}), 404  # Return a 404 response if rental ID not found

    if rental.return_date is not None:
        return jsonify({'error': 'Movie has already been returned'}), 400  # Return a 400 response if movie has already been returned

    rental.return_date = datetime.now()

    try:
        db.session.commit()
        return jsonify({'message': 'Movie returned successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/viewCustomerDetails/<int:customer_id>', methods=['GET'])
def viewCustomerDetails(customer_id):
    query = text('''
        SELECT c.first_name, c.last_name, c.email, c.store_id, f.title, r.return_date
        FROM customer c
        JOIN rental r ON c.customer_id = r.customer_id
        JOIN inventory i ON r.inventory_id = i.inventory_id
        JOIN film f ON i.film_id = f.film_id
        WHERE c.customer_id = :customer_id;
    ''')
    result = db.session.execute(query, {"customer_id": customer_id})
    customer = [{'first_name': row.first_name, 'last_name': row.last_name, 'email': row.email, 'store_id': row.store_id, 'title': row.title,
                 'return_date': row.return_date} for row in result]
    return jsonify({'customer': customer}), 200

@app.route('/viewCustomers', methods=['GET'])
def getCustomers():
    query= text('''
        SELECT c.first_name, c.last_name, c.customer_id, c.email, c.address_id, c.store_id
        FROM customer c;
    ''')
    
    result = db.session.execute(query)
    customers=[{'first_name': row.first_name, 'last_name': row.last_name, 'customer_id': row.customer_id,
                'email': row.email, 'address_id': row.address_id, 'store_id': row.store_id} for row in result]
    return jsonify({'customers': customers})

# Search for the customer based on either first name, last name, or id number
@app.route('/searchCustomer', methods=['GET'])
def searchCustomers():
    search_input = request.args.get('searchInput')

    # original base query
    query_org = '''
        SELECT c.first_name, c.last_name, c.customer_id, c.email, c.address_id, c.store_id
        FROM customer c
        WHERE 1=1
    '''

    # Based on search input (first name, last name, id), apply these conditions
    params = {}
    if search_input:
        query_org += " AND (c.first_name LIKE :search_input OR c.last_name LIKE :search_input OR c.customer_id LIKE :search_input)"
        params['search_input'] = f"%{search_input}%"
        
    query = text(query_org)
    result = db.session.execute(query, params)
    customers = [{'first_name': row.first_name, 'last_name': row.last_name, 'customer_id': row.customer_id,
                  'email': row.email, 'address_id': row.address_id, 'store_id': row.store_id} for row in result]

    return jsonify({'customers': customers})

# Edit customer information endpoint
@app.route('/editCustomer/<int:customer_id>', methods=['PATCH'])
def editCustomer(customer_id):
    try:
        # Get the customer object
        customer = db.session.get(Customer, customer_id)
        
        # If the customer is not found, run this
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        data = request.json

        # Check the fields entered by the user
        for field, value in data.items():
            if value:
                # Update the customer information based on whether or not they entered data in the field
                if field == 'firstName':
                    customer.first_name = value
                elif field == 'lastName':
                    customer.last_name = value
                elif field == 'email':
                    customer.email = value
                elif field == 'addressId':
                    customer.address_id = value

        # Commit changes to the database
        db.session.commit()
        
        return jsonify({'message': 'Customer information updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Adds a customer to the database
@app.route('/addCustomer', methods=['POST'])
def addCustomer():
    # Get the information requested upon user input
    store_id = request.json.get('store_id')
    first_name = request.json.get('first_name')
    last_name = request.json.get('last_name')
    email = request.json.get('email')
    address_id = request.json.get("address_id")
    
    # Crate a new customer with the requested data
    new_customer = Customer(store_id=store_id, first_name=first_name, last_name=last_name, email=email, address_id=address_id, active='1')
    
    # Add the new customer to the database and commit changes
    db.session.add(new_customer)
    db.session.commit()
    
    # Successful customer creation message
    response_data = {
        'customer_id': new_customer.customer_id,
        'message': 'Customer added successfully'
    }
    
    return jsonify(response_data), 201  

# Deletes a customer from the database
@app.route('/deleteCustomer/<int:customer_id>', methods=['DELETE'])
def deleteCustomer(customer_id):
    customer = Customer.query.get(customer_id)
    if customer:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'}), 200
    else:
        return jsonify({'error': 'Customer not found'}), 404

# Search a film by the title name
@app.route('/searchByTitle/<string:title>', methods=['GET'])
def getFilmByTitle(title):
    query = text('''
    SELECT f.title, f.film_id
    FROM film f
    WHERE f.title = :title
    ''')
    
    result = db.session.execute(query, {"title": title})
    foundFilm=[{'title': row.title, "film_id": row.film_id} for row in result]
    return jsonify({'film': foundFilm})

# search films based on their category
@app.route('/searchByCategory/<string:category>', methods=['GET'])
def getFilmsByCategory(category):
    query = text('''
        SELECT f.film_id, f.title, fc.category_id, c.name
        FROM film f
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON fc.category_id = c.category_id
        WHERE c.name = :category;
    ''')
    
    result = db.session.execute(query, {"category": category})
    foundCategory=[{'film_id': row.film_id, 'title': row.title, 'category_id': row.category_id, 'name': row.name} for row in result]
    return jsonify({'category': foundCategory})

# search films based on actors in film
@app.route('/searchByActor/<string:name>', methods=['GET'])
def getFilmsByActor(name):
    query = text('''
        SELECT a.actor_id, a.first_name, a.last_name, f.film_id, f.title
        FROM actor a
        JOIN film_actor fa ON fa.actor_id = a.actor_id
        JOIN film f ON fa.film_id = f.film_id
        WHERE CONCAT(a.first_name, ' ', a.last_name) = :name;
    ''')
    
    result = db.session.execute(query, {'name': name})
    foundActor=[{'actor_id': row.actor_id, 'first_name': row.first_name, 'last_name': row.last_name,
                 'film_id': row.film_id, 'title': row.title} for row in result]
    return jsonify({'name': foundActor})

# Creates a new rental table and adds the rental to the database
@app.route('/addRental', methods=['POST'])
def add_rental():
    try:
        data = request.json
        print('Received data:', data) 
        inventory_id = data.get('inventory_id')
        customer_id = data.get('customer_id')
        staff_id = data.get('staff_id')
        
        if not (inventory_id and customer_id and staff_id):
            raise ValueError('Missing required fields')

        return jsonify({'message': 'Rental added successfully.'}), 201
    except Exception as e:
        print('Error:', e)  
        return jsonify({'error': str(e)}), 400
    
@app.route('/topFiveFilms', methods=['GET'])
def getMovies():
    # Define the SQL query
    query = text('''
    SELECT f.film_id, f.title, c.name, COUNT(*) as rental_count
    FROM film f
    JOIN film_category fc ON fc.film_id = f.film_id
    JOIN category c ON c.category_id = fc.category_id
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    GROUP BY f.film_id, f.title, c.name
    ORDER BY rental_count DESC
    LIMIT 5;
    ''')

    # Execute the query
    result = db.session.execute(query)

    # Convert the result to a list of dictionaries
    films = [{'film_id': row.film_id, 'title': row.title, 'category_name': row.name, 'rental_count': row.rental_count} for row in result]

    # Return the results in JSON format
    return jsonify({'film': films})

@app.route('/topFiveActors', methods=['GET'])
def getActors():
    # Define the SQL query
    query = text('''
    SELECT a.actor_id, a.first_name, a.last_name, COUNT(*) AS movies
    FROM actor a
    JOIN film_actor fa
    ON a.actor_id = fa.actor_id
    GROUP BY a.actor_id, a.first_name, a.last_name
    ORDER BY movies DESC
    LIMIT 5;
    ''')

    # Execute the query
    result = db.session.execute(query)

    # Convert the result to a list of dictionaries
    topActors = [{'actor_id': row.actor_id, 'first_name': row.first_name, 'last_name': row.last_name} for row in result]

    # Return the results in JSON format
    return jsonify({'actor': topActors})

@app.route('/displayActorDetails/<int:actor_id>', methods=['GET'])
def getActorDetails(actor_id):
    query = text('''
    SELECT a.actor_id, a.first_name, a.last_name, f.title, f.description, f.release_year, f.length, f.rating, c.name, COUNT(*) as rental_count
    FROM actor a
    JOIN film_actor fa ON a.actor_id = fa.actor_id
    JOIN film f ON fa.film_id = f.film_id
    JOIN film_category fc ON fc.film_id = f.film_id
    JOIN category c ON c.category_id = fc.category_id
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    WHERE a.actor_id = :actor_id
    GROUP BY a.actor_id, a.first_name, a.last_name, f.title, f.description, f.release_year, f.length, f.rating, c.name
    ORDER BY rental_count DESC
    LIMIT 5;
    ''')
    
    result = db.session.execute(query, {"actor_id": actor_id})
    actor_details = [{'actor_id':row.actor_id, 'first_name': row.first_name, 'last_name': row.last_name, 'film_title': row.title,
                      'description': row.description, 'release_year': row.release_year, 'length': row.length, 
                      'rating': row.rating, 'category': row.name} for row in result]
    return jsonify({'actor_details': actor_details})

@app.route('/displayFilmDetails/<int:film_id>', methods=['GET'])
def getDetails(film_id):
    # Define the SQL query
    query = text('''
    SELECT f.title, f.description, f.release_year, fc.category_id, c.name, f.length, f.rating, f.special_features, 
           f.rental_duration, f.rental_rate, i.film_id, COUNT(*) AS Total_Available
    FROM film f
    JOIN inventory i ON f.film_id = i.film_id
    JOIN film_category fc ON f.film_id = fc.film_id
    JOIN category c ON c.category_id = fc.category_id
    WHERE i.film_id = :film_id
    GROUP BY f.title, f.description, f.release_year, fc.category_id, c.name, f.length, f.rating, f.special_features, f.rental_duration, f.rental_rate, i.film_id;
    ''')

    # Execute the query
    result = db.session.execute(query, {"film_id": film_id})

    # Convert the result to a list of dictionaries
    film_details = [{'title': row.title, 'description': row.description, 'release_year': row.release_year,
                     'category_name': row.name, 'category_id': row.category_id, 'length': row.length, 'rating': row.rating, 
                     'special_features': row.special_features,'rental_duration': row.rental_duration, 'rental_rate': row.rental_rate,
                     'film_id': row.film_id, 'total_available': row.Total_Available} for row in result]

    # Return the results in JSON format
    return jsonify({'film_details': film_details})

if __name__ == "__main__":
    app.run(debug=True)