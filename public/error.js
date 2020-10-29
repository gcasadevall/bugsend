/**
 * Define todas las clases de error a usar.
 */

export default class MyError extends Error {

    constructor(msg) {
        super();
        this.msg = msg;
    }
}
     
  