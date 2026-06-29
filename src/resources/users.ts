import type { Luma } from "../luma";
import type { User } from "../types";

export class UsersResource {
  constructor(private readonly luma: Luma) {}

  get() {
    return this.luma.request<User>("GET", "/v1/users/get-self");
  }
}