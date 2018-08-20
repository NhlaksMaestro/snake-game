import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { AppComponent } from './app.component';
import { SnakePlaygroundComponent } from './snake-playground/snake-playground.component';

@NgModule({
  declarations: [
    AppComponent,
    SnakePlaygroundComponent
  ],
  imports: [
    BrowserModule, FormsModule, ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
