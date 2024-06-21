import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseClient, User, createClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser: BehaviorSubject<User | boolean> = new BehaviorSubject<
    boolean | User
  >(false);

  constructor(private router: Router) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.supabase.auth.onAuthStateChange((event, sess) => {
      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        sess?.user
      ) {
        this.currentUser.next(sess?.user);
      } else {
        this.currentUser.next(false);
      }
    });

    this.loadUser();
  }

  async loadUser() {
    if (this.currentUser.value) return;

    const user = await this.supabase.auth.getUser();

    if (user.data.user) {
      this.currentUser.next(user.data.user);
    } else {
      this.currentUser.next(false);
    }
  }

  async signUp(credentials: { email: string; password: string }) {
    return this.supabase.auth.signUp(credentials);
  }

  async signIn(credentials: { email: string; password: string }) {
    return this.supabase.auth.signInWithPassword(credentials);
  }

  async googleAuth() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  }

  async facebookAuth() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { skipBrowserRedirect: true },
    });
  }

  async sendPasswordReset(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email);
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  getCurrentUser(): Observable<User | boolean> {
    return this.currentUser.asObservable();
  }

  getCurrentUserId(): string {
    return (this.currentUser.value as User).id;
  }

  signInWithEmail(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  signInWithPhoneNo(phone: string) {
    return this.supabase.auth.signInWithOtp({ phone });
  }
}
