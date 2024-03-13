# Distributed System Assignment01
Student Name: HaoxuanGu  
Student Id: 20100200  
Lecturer: Diarmuid O'Connor  
Demo: https://www.youtube.com/watch?v=mMEKl478ABo
## Api
Auth-API:  
POST /auth/signup  - User signup  
POST /auth/confirm_signup - User signup confirm  
POST /auth/signin - User signin  
POST /auth/signout - User signout  
App-Api  
Authenticated
POST /movies/reviews - Add a movie review.  
PUT /movies/{movieId}/reviews/{reviewerName} - Update the text of a review.  
Public  
GET /movies - Get all movie details.   
GET /movies/{movieId} - Get movie details by movie Id.  
GET /movies/{movieId}/reviews - Get all movie reviews by movie Id.  
GET /movies/{movieId}/reviews?minRating=n - Get the reviews for the specified movie with a rating greater than the minRating.  
GET /movies/{movieId}/reviews/{reviewerName} - Get the review written by the named reviewer for the specified movie.   
GET /movies/{movieId}/reviews/{year} - Get the reviews written in a specific year for a specific movie.  
GET /reviews/{reviewerName} - Get all the reviews written by a specific reviewer.  
![AuthAPI](image-16.png)  
![AppAPI1](image-18.png)  
![AppAPI2](image-19.png)
### Auth-Api

#### POST /auth/signup  - User signup  
 ![User signup](image-2.png)  
#### POST /auth/confirm_signup - User signup confirm  
![User confirm_signup](image-3.png)
#### POST /auth/signin - User signin  
![User signin](image-4.png)
#### POST /auth/signout - User signout  
![User signout](image-5.png)

### App-Api

#### Only authenticatedusers are allowed to perform:  
![Without auth](image-6.png) 
##### POST /movies/reviews - Add a movie review.  
![Add a movie review](image-7.png)
##### PUT /movies/{movieId}/reviews/{reviewerName} - Update the text of a review.  
![Modify a review](image-8.png)
#### Public:  
##### GET /movies - Get all movie details.  
![Get all movies and details](image-9.png)
##### GET /movies/{movieId} - Get movie details by movie Id. 
![Get movie detals by movie Id](image-10.png) 
##### GET /movies/{movieId}/reviews - Get all movie reviews by movie Id.  
![Get all movie reviews by movie Id](image-11.png)
##### GET /movies/{movieId}/reviews?minRating=n - Get the reviews for the specified movie with a rating greater than the minRating. 
![Greater than the minRating](image-12.png)
##### GET /movies/{movieId}/reviews/{reviewerName} - Get the review written by the named reviewer for the specified movie.  
![Get review written by the named reviewer for the specified movie](image-13.png)
##### GET /movies/{movieId}/reviews/{year} - Get the reviews written in a specific year for a specific movie.  
![Get the reviews written in a specific year for a specific movie](image-14.png)
##### GET /reviews/{reviewerName} - Get all the reviews written by a specific reviewer.  
![Get all the reviews written by a specific reviewer](image-15.png)