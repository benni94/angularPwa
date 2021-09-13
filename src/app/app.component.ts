import { ApplicationRef, Component, OnInit } from '@angular/core';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { interval, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'angularPwa';

  constructor(
    private http: HttpClient,
    private update: SwUpdate,
    private appRef: ApplicationRef,
    private swPush: SwPush,
  ) {
    //this.updateClient();
  }
 
  test=0;

  apiData: any;
  ngOnInit(): void {
    if (this.swPush.isEnabled) {
      setInterval(()=>{
        this.testGet();
      },10000)
    }
    this.http.get('http://dummy.restapiexample.com/api/v1/employees')
      .subscribe((ev: any) => {
        this.apiData = ev.data;
      },
        (err => {
          console.log(err);
        })
      );
  }

  testGet(){
    async function showNotification() {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        const noti = new Notification('Hello!', {
          body: 'It’s me.',
          icon: './assets/icons/icon-152x152.png'
        });
        noti.onclick = () => alert('clicked');
      }
    }
    showNotification();
  }

  updateClient() {
    if (!this.update.isEnabled) {
      console.log("not enabled");
      return;
    }

    //show a message to the user like confirm(blablabla) and when he hits ok 
    // the browser will be reloaded with the location.reload
    //if current hash is the same as the available hash the version don't have to update
    this.update.available.subscribe((event: any) => {
      console.log("current", event.current, "available", event.available);

      if (confirm("update available for the app, please conform")) {
        //if update the location will be reloaded => both hashes(current and available) 
        //must be different
        this.update.activateUpdate()
          .then(() => location.reload());
      }
    })


    this.update.activated.subscribe((event) => {
      console.log("current", event.previous, "available", event.current);
    })
  }

  //don't call it somwhere, it will be called in the update!!!
  checkUpdate() {
    this.appRef.isStable.subscribe((isStable) => {
      if (isStable) {

        //use for the timeinterval of rxjs to subscribe only if the intervall is finished
        const timeInterval = interval(5000);//6 * 60 * 60 * 1000
        timeInterval.subscribe(() => {

          //after that the update will be checked in the apk best of 6h plus
          this.update.checkForUpdate()
            .then(() => {
              console.log("checked");
            });
          console.log("update checked");
        })
      }
    })
  }

  pushSubscription() {
    if (!this.swPush.isEnabled) {
      console.log("SwPush is not enabled");
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: '', //some key from nodeJs ????
    })
      .then(sub => console.log).catch(err => console.log);
  }
}
