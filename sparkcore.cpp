TCPClient client;

int LED = A4;

byte server[] = {52, 28, 54, 201 };
char make_request() {
    Serial.println("connecting...");

    digitalWrite(LED, HIGH);
    if (client.connect(server, 80)) {
        Serial.println("connected");
        client.println("GET /api/direction HTTP/1.0");
        client.println("Host: spark.pyphy.com");
        client.println("Connection: close");
        client.println("Content-Length: 0");
        client.println();
    } else {
        Serial.println("connection failed");
    }
    digitalWrite(LED, LOW);
    delay(10);
    digitalWrite(D7, HIGH);
    unsigned long killtime = millis();
    // Serial.print("Still connected?: ");
    Serial.println(client.connected());
    while (client.connected()) {
        if (millis() - killtime > 1000) {
            Serial.println("Killing request...");
            break;
        }
        char search = '0';
        while (client.available()) {
            digitalWrite(D7, LOW);
            char cur = client.read();
            // Serial.print(cur);
            if (search > '9') {
                client.stop();
                // Serial.println("");
                return cur;
            }
            if (cur == search) {
                search += 1;
            } else {
                search = '0';
            }
        }
    }
    client.stop();
    Serial.println("Fallback to 'l'");
    return 'l';
}

// void but_request() {
//     Serial.println("Button connecting...");

//     digitalWrite(LED, HIGH);
//     if (client.connect(server, 80)) {
//         Serial.println("connected");
//         client.println("GET /api/smash HTTP/1.0");
//         client.println("Host: dragon.pyphy.com");
//         client.println("Connection: close");
//         client.println("Content-Length: 0");
//         client.println();
//     } else {
//         Serial.println("Button connection failed");
//     }
//     digitalWrite(LED, LOW);
//     delay(10);
//     digitalWrite(D7, HIGH);
//     while (client.connected()) {}
//     client.stop();
// }


int right_power = D0;
int left_power = D5;

int right_front = D1;
int right_back = D2;

int left_front = D3;
int left_back = D4;

// int button = D6;

bool naprej = true;


/* This function is called once at start up ----------------------------------*/
void setup() {
    Spark.disconnect();
    Serial.begin(9600);
	
    // pinMode(button, INPUT);
    
    pinMode(LED, OUTPUT);
    digitalWrite(LED, LOW);
    
    pinMode(D7, OUTPUT);
    digitalWrite(D7, LOW);
    
    pinMode(right_power, OUTPUT);
    pinMode(left_power, OUTPUT);
    
    digitalWrite(right_power, HIGH);
    digitalWrite(left_power, HIGH);

  
    pinMode(right_front, OUTPUT);
    pinMode(right_back, OUTPUT);
    
    digitalWrite(right_front, LOW);
    digitalWrite(right_back, LOW);
    
    pinMode(left_front, OUTPUT);
    pinMode(left_back, OUTPUT);
    
    digitalWrite(left_front, LOW);
    digitalWrite(left_back, LOW);
}

void right() {
    digitalWrite(right_front, LOW);
    digitalWrite(right_back, HIGH);
    digitalWrite(left_front, HIGH);
    digitalWrite(left_back, LOW);
}

void left() {
    digitalWrite(right_front, HIGH);
    digitalWrite(right_back, LOW);
    digitalWrite(left_front, LOW);
    digitalWrite(left_back, HIGH);
}

void front() {
    digitalWrite(right_front, HIGH);
    digitalWrite(right_back, LOW);
    digitalWrite(left_front, HIGH);
    digitalWrite(left_back, LOW);
}

void back() {
    digitalWrite(right_front, LOW);
    digitalWrite(right_back, HIGH);
    digitalWrite(left_front, LOW);
    digitalWrite(left_back, HIGH);
}

void stop() {
    digitalWrite(right_front, LOW);
    digitalWrite(right_back, LOW);
    digitalWrite(left_front, LOW);
    digitalWrite(left_back, LOW);
}


void loop() {
	delay(80);
// 	int crash = digitalRead(button);
// 	Serial.println("Button");
// 	Serial.println(crash);
// 	if (crash == HIGH) {
// 	    but_request();
// 	}
	char direction = make_request();
	Serial.println(direction);
	if (direction == 'l') {
	    left();
	} else if (direction == 'r') {
	    right();
	} else if (direction == 's') {
	    stop();
	} else if (direction == 'f') {
	    front();
	} else if (direction == 'b') {
	    back();
	}
}
