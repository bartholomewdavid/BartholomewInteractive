import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeroComponent } from './components/hero/hero.component';

import { FullSizeDirective } from './directives/full-size.directive';
import { BackDropDirective } from './directives/back-drop.directive';
import { SkillsComponent } from './components/skills/skills.component';
import { BrandsComponent } from './components/brands/brands.component';
import { ContractingComponent } from './components/contracting/contracting.component';
import { ContactComponent } from './components/contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    HeroComponent,
    FullSizeDirective,
    BackDropDirective,
    SkillsComponent,
    BrandsComponent,
    ContractingComponent,
    ContactComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
