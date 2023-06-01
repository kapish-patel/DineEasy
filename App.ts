//Imports
import { RestaurantModel } from "./models/RestaurantModel";
import { MenuModel } from "./models/MenuModel";
import { MenuItemsModel } from "./models/MenuItemsModel";
import express = require("express");
import * as bodyParser from "body-parser";
import { OrderModel } from "./models/OrderModel";
import { CustomerModel } from "./models/CustomerModel";
import cors from "cors";
import { ReservationModel } from "./models/ReservationModel";
import GooglePassportObj from './GooglePassport';
import passport = require("passport");
import path = require("path");
import { v4 as uuidv4 } from "uuid";
const session = require('express-session');
const cookieParser = require('cookie-parser');


// Class App which creates and configure the express application
class App {
  public expressApp: express.Application;
  public Restaurants: RestaurantModel;
  public Menu: MenuModel;
  public MenuItems: MenuItemsModel;
  public Orders: OrderModel;
  public Reservation: ReservationModel;
  public Customer: CustomerModel;
  public googlePassportObj:GooglePassportObj;
  public sessionKey: string;

  // Constructor which runs the configuration on the express application and calls the routes function
  constructor() {
    this.expressApp = express();
    this.Restaurants = new RestaurantModel();
    this.Menu = new MenuModel();
    this.MenuItems = new MenuItemsModel();
    this.Orders = new OrderModel();
    this.Customer = new CustomerModel();
    this.Reservation = new ReservationModel();
    this.googlePassportObj = new GooglePassportObj();
    this.sessionKey = uuidv4();
    this.middleware();
    this.routes();
    
  }

  // Configure the middleware of express application
  private middleware(): void {
    this.expressApp.use(cors());
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: true }));
    this.expressApp.use(express.static(path.join(__dirname, '/frontend/dist')));
    this.expressApp.use(session({ 
      secret: 'keyboard ysaeenid',  
      resave: true,
      saveUninitialized: true }));
    this.expressApp.use(cookieParser());
    this.expressApp.use(passport.initialize());
    this.expressApp.use(passport.session());
  }

  private validateAuth(req:any, res:any, next:any):void {
    if (req.isAuthenticated()) { 
      console.log("user is authenticated" );
      return next(); 
    }
    console.log("user is not authenticated");
    res.redirect('/');
  }
  
  // Api Endpoints....
  private routes(): void {
    let router = express.Router();

    router.get('/auth/google', 
    passport.authenticate('google', {scope: ['profile', 'email']}),
    (req, res) => {
      console.log("Localhost: successfully authenticated user and returned to callback page.");
      res.redirect('/');
    });

    router.get('/auth/google/callback', 
      passport.authenticate('google', 
        { failureRedirect: '/' }
      ),
      (req, res) => {
        console.log("successfully authenticated user and returned to callback page.");
        res.redirect('/');
    });

    router.get('/check-auth', (req, res) => {
      if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
      } else {
        res.json({ authenticated: false });
      }
    });

    router.get('/user/:userId', this.validateAuth, (req, res) => {
      if (req.user) {
        let userId = req.params.userId;
        this.Customer.retrieveCustomer(res, {customerId: userId});
      } else {
        console.log('User not authenticated');
        res.status(401).json({ message: 'User not authenticated' });
      }
    });
    
    
    router.post('/logout', this.validateAuth, (req, res, next) => {
      req.logout(function(err) {
        if (err) {
          console.log(err);
           return next(err); 
          }
        res.redirect('/');
      });
    });
    

    // Retrieve all the restaurant endpoint
    router.get("/restaurants", (req: any, res: any) => {
      console.log("Query all the restaurants");
      this.Restaurants.retrieveAllRestaurants(res);
    });

    // Retrieve specific restaurant details
    router.get("/restaurants/:resId", (req: any, res: any) => {
      let resId = req.params.resId;
      console.log("Query single restaurant with id: " + resId);
      this.Restaurants.getRestaurantDetailsById(res, { resId: resId });
    });

    // Routing post order requests to save data
    //Create restaurant
    router.post("/restaurants", (request: any, response: any) => {
      console.log("Creating restaurant");
      this.Restaurants.createRestaurant(request, response);
    });

    //Delete Restaurant
    router.delete("/restaurants/:resId", (req: any, res: any) => {
      this.MenuItems.deleteAllMenuItemsForRestaurant(req, res, () => {
        this.Menu.deleteAllMenuForRestaurant(req, res, () => {
          this.Restaurants.deleteRestaurant(req, res);
        });
      });
    });

    //Update restaurant
    router.put("/restaurants/:resId", (req: any, res: any) => {
      this.Restaurants.updateRestaurant(req, res);
    });

    //Retrieve Menu
    router.get("/restaurants/:resId/menu", (req: any, res: any) => {
      var resId = req.params.resId;
      console.log("Query single menu with restid: " + resId);
      this.Menu.retrieveMenu(res, { resId: resId });
    });

    //Create menu
    router.post("/restaurants/:resId/menu", (req: any, res: any) => {
      this.Menu.createMenu(req, res);
    });

    //Delete menu
    router.delete("/restaurants/:resId/menu/:menuId", (req: any, res: any) => {
      this.MenuItems.deleteAllMenuItems(req, res, () => {
        this.Menu.deleteMenu(req, res);
      });
    });

    //Retrieve Menu Items
    router.get("/restaurants/:resId/menu/:menuId/items", (req: any, res: any) => {
        var resId = req.params.resId;
        var menuId = req.params.menuId;
        console.log("Query single menu of menu id: " + menuId + " with restid: " + resId);
        this.MenuItems.retrieveMenuItems(res, {
          menuId: menuId,
          resId: resId,
        });
      }
    );

    // Create menu Items
    router.post("/restaurants/:resId/menu/:menuId/items", (req: any, res: any) => {
      console.log("In post menu item")
        var resId = req.params.resId;
        var menuId = req.params.menuId;
        console.log(req.body);
        this.MenuItems.createMenuItems(req, res, {
          menuId: menuId,
          resId: resId
        });
      }
    );

    // Delete menu Items
    router.delete( "/restaurants/:resId/menu/:menuId/items", (req: any, res: any) => {
        this.MenuItems.deleteMenuItems(req, res);
      }
    );

    // update menu Items
    router.patch( "/restaurants/:resId/menu/:menuId/items", (req: any, res: any) => {
        this.MenuItems.updateMenuItems(req, res);
      }
    );

    // post order - figure out the route
    router.post("/restaurants/:resId/menu/:menuid/items/order", (request: any, response: any) => {
      console.log("posting order");
      this.Orders.createOrder(request, response);
    });

    // post- create customer
    router.post("/addcustomer", (request: any, response: any) => {
      console.log("Adding New Customer:...");
      this.Customer.createCustomer(request, response);
    });

    //post- customer update
    router.post("/updatecustomer/:customerId", (req: any, res: any) => {
      console.log("Update Customer:...");
      this.Customer.updateCustomer(req, res);
    });

    // post reservations
    router.post("/addreservation", (request, response) => {
      console.log("Adding New Reservation");
      this.Reservation.createReservation(request, response);
    });

    // get reservations
    router.get("/reservation", (request, response) => {
      console.log("Query all reservations");
      this.Reservation.getAllReservations(response);
    });

    // update reservation
    router.patch("/reservation/:reservationId", (request, response) => {
      console.log("Updating Reservation");
      this.Reservation.updateReservation(request, response);
    });

    // delete reservation
    router.delete("/reservation/:reservationId", (request, response) => {
      console.log("Deleting Reservation");
      this.Reservation.cancelReservation(request, response);
    })
    
    this.expressApp.use("/", router);
    
  }
}

export { App };
