#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <secrets.h>

const int sensorPin = 21;
struct ConnectionState {
  bool isWifiReconnecting = false;
  bool isMQTTReconnecting = false;
};

struct ConnectionTimeouts {
  int MQTTConnectInterval = 6000;
  unsigned long lastMqttReconnectMillis = 0;
};

const unsigned int publishInterval = 6000; 
unsigned long latePublishMillis = 0;
struct ConnectionState connectionState;
struct ConnectionTimeouts connectionTimeouts;
WiFiClient espClient;
PubSubClient client(espClient);

void connectToWifi();
void connectToMqtt();
void mqttCallback();

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  connectToWifi();
  pinMode(sensorPin, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  if(!WiFi.isConnected()) return connectToWifi();
  if(!client.connected()) return connectToMqtt();
  if(digitalRead(sensorPin) == HIGH){
    const int now = millis();
    if(now - latePublishMillis > publishInterval) {
      client.publish("esp/earthquake", "");
      Serial.println("gempa");
      latePublishMillis = millis();
    }
  }
}

void mqttCallback(char* topic, byte* message, unsigned int length){

};

void connectToWifi(){
  if(connectionState.isWifiReconnecting) return;
  connectionState.isWifiReconnecting = true;
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to the WiFi");
  while( !WiFi.isConnected() ){
    Serial.print(".");
  }
  Serial.println("Connected to the WiFi");
  Serial.print("IP : ");
  Serial.println(WiFi.localIP());
  connectionState.isWifiReconnecting = false;
}

void connectToMqtt(){
  if(connectionState.isMQTTReconnecting || client.connected() || (millis() -  connectionTimeouts.lastMqttReconnectMillis) < connectionTimeouts.MQTTConnectInterval) return;
  connectionState.isMQTTReconnecting = true;
  connectionTimeouts.lastMqttReconnectMillis = millis();
  Serial.println("Attemping MQTT Connection");
  client.setServer(MQTT_ADDRESS, MQTT_PORT);
  if(client.connect("ESP32Client")){
    Serial.println("Connected to the broker");
  } else {

  }
  connectionState.isMQTTReconnecting = false;
  // client.setCallback(mqttCallback);
}

