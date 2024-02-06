from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import text

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
    special_features = db.Column(db.Enum('Trailers', 'Commentaries', 'Deleted Scenes', 'Behind the Scenes'))
    rental_duration = db.Column(db.SmallInteger, nullable=False)
    rental_rate = db.Column(db.DECIMAL(4, 2), nullable=False)

class Inventory(db.Model):
    __tablename__ = 'inventory'
    inventory_id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.SmallInteger, db.ForeignKey('film.film_id'))
    store_id = db.Column(db.SmallInteger, db.ForeignKey('store.store_id'))
    
class Actor(db.Model):
    __tablename__ = 'actor'
    actor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45))
    last_name = db.Column(db.String(45))

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

@app.route('/searchByCategory/<string:category>', methods=['GET'])
def getFilmsByCategory(category):
    query = text('''
        SELECT f.film_id, fc.category_id, c.name
        FROM film f
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON fc.category_id = fc.category_id;
    ''')
    
    result = db.session.execute(query, {"category": category})
    foundCategory=[{'film_id': row.film_id, 'category_id': row.category_id, 'name': row.name} for row in result]
    return jsonify({'category': foundCategory})

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
    SELECT f.title, f.description, f.release_year, f.length, f.rating, f.special_features, 
           f.rental_duration, f.rental_rate, i.film_id, COUNT(*) AS Total_Available
    FROM film f
    JOIN inventory i ON f.film_id = i.film_id
    WHERE i.film_id = :film_id
    GROUP BY f.title, f.description, f.release_year, f.length, f.rating, f.special_features, f.rental_duration, f.rental_rate, i.film_id;
    ''')

    # Execute the query
    result = db.session.execute(query, {"film_id": film_id})

    # Convert the result to a list of dictionaries
    film_details = [{'title': row.title, 'description': row.description, 'release_year': row.release_year,
                     'length': row.length, 'rating': row.rating, 'special_features': row.special_features,
                     'rental_duration': row.rental_duration, 'rental_rate': row.rental_rate,
                     'film_id': row.film_id, 'total_available': row.Total_Available} for row in result]

    # Return the results in JSON format
    return jsonify({'film_details': film_details})

if __name__ == "__main__":
    app.run(debug=True)