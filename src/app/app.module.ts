import { NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './core/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './features/registration/registration.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgxFileDropModule } from '@bugsplat/ngx-file-drop';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { CartComponent } from './features/checkout/cart/cart.component';
import { ConfirmationComponent } from './features/checkout/confirmation/confirmation.component';
import { isPlatformBrowser } from '@angular/common';
import { MessageComponent } from './features/message/message.component';


export function tokenGetter(platformId: Object) {
  return () => {
    if (isPlatformBrowser(platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  };
}


@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    CartComponent,
    ConfirmationComponent,
    MessageComponent
    
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    NgxFileDropModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter(PLATFORM_ID),
      }
    })
    //HttpClientModule
    
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    //{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
