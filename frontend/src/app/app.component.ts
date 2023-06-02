import { Component } from '@angular/core';
import { AuthenticationService } from './service/authentication.service';
import { ICustomerModel } from './interfaces/ICustomerModelAngular';
import { Router } from '@angular/router';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'DineEasy'; 
  restaurantImage = '../assets/images/DineEasy.jpg';
  profileData: ICustomerModel;
  showProfileForm = false;
  
  showOptionsFlag: boolean = false;

  constructor(public authenticationService: AuthenticationService, private router: Router) {
  }

  profile()
  {
    this.router.navigateByUrl('/updateProfile/'+ this.authenticationService.user.userId);
  }

  showOptions() {
    this.showOptionsFlag = true;
  }

  hideOptions(event: MouseEvent) {
    setTimeout(() => {
      this.showOptionsFlag = false;
    }, 3000);
  }

  toggleOptions() {
    this.showOptionsFlag = !this.showOptionsFlag;
  }

  login() {
    this.authenticationService.login();
  }



  logout() {
    console.log("Logout in app")
    // this.authenticationService.isLoggingOut = true;
    // this.authenticationService.setAuthenticated(false);
    // this.authenticationService.logout();
    this.authenticationService.logout().subscribe((response) => {
          console.log(response)
          window.location.href = '/';
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

}
