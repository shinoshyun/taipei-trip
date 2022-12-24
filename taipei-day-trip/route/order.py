from flask import Flask, Blueprint, make_response, request
from dotenv import load_dotenv
import os, requests, json, jwt, re
from datetime import datetime

load_dotenv()

order = Blueprint('order', __name__)
import mysql.connector
mysql_connection = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password=os.getenv("password"),
    database='attractions_data'
)

cursor = mysql_connection.cursor(buffered=True, dictionary=True)



@order.route("/api/orders", methods=["POST"])
def orderPost():
    try:
        token = request.cookies.get("token")
        
        if token:
            data = jwt.decode(token, "mykey123", algorithms=["HS256"])
            userId = str(data["id"])
            req = request.get_json()
            prime = req["prime"]
            price = req["order"]["price"]
            trip = req["order"]["trip"]
            attractionId = trip["attraction"]["id"]
            attractionName = trip["attraction"]["name"]
            attractionAddress = trip["attraction"]["address"]
            attractionImage = trip["attraction"]["image"]
            date = trip["date"]
            time = trip["time"]

            contactName = req["order"]["contact"]["name"]
            contactEmail = req["order"]["contact"]["email"]
            contactPhone = req["order"]["contact"]["phone"]

            if contactName and contactEmail and contactPhone:

                check="SELECT booking.attractionId, booking.date, booking.time, booking.price FROM booking WHERE booking.userId = %s"

                check_value=(userId,)
                cursor.execute(check, check_value)
                records = cursor.fetchone()
                # print(records)

                attractionId = records["attractionId"]
                date = records["date"]
                time = records["time"]
                price = records["price"]

                currentDateAndTime = datetime.now()

                number = datetime.strftime(currentDateAndTime, "%Y%m%d%H%M%S")
                
                insertCommand = """
                INSERT INTO orders 
                (attractionId, date, time, price, number, 
                contactName, contactEmail, contactPhone) 
                VALUES(%s, %s, %s, %s, %s, %s, %s, %s)"""
                insert = (attractionId, date, time, price, number, contactName, contactEmail, contactPhone)
                cursor.execute(insertCommand, insert)
                mysql_connection.commit()

                cursor.execute("SELECT number FROM orders")
                records = cursor.fetchone()
                # date_object = records["number"]

                tappayData = {
                    "prime": prime,
                    "partner_key": os.getenv("tappayKey"),
                    "merchant_id": "shino_TAISHIN",
                    "details":"TapPay Test",
                    "amount": 100,
                    "cardholder": {
                        "phone_number": contactPhone,
                        "name": contactName,
                        "email": contactEmail,
                    },
                    "remember": True
                }
                tapPayData = json.dumps(tappayData)

                headers = {
                "Content-Type": "application/json",
                "x-api-key": os.getenv("tappayKey")
                }
                tapPayRequests = requests.post("https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime", data=tapPayData, headers=headers).json()
                
                if tapPayRequests["status"] == 0:
                    data = {
        	            "number": number,
                        "payment": {
        	                "status": tapPayRequests["status"],
                            "message":"付款成功"
                            }
        	        }

                    deleteBooking = "DELETE FROM booking WHERE userId = %s"
                    deleteData = (userId,)
                    cursor.execute(deleteBooking, deleteData)
                    mysql_connection.commit()

                    res = make_response({"data": data}, 200)
                    return res

                else:
                    res = make_response(({
			        "error": True,
			        "message": "訂單建立失敗，輸入不正確或其他原因"}), 400)
                    return res    

        else:
            res = make_response(({
				"error": True,
				"message": "未登入系統，拒絕存取"}), 403)
            return res


    except Exception as e:
            print(e)
            res = make_response(({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)
            return res


@order.route("/api/orders/<orderNumber>", methods=["GET"])
def orderGet(orderNumber):
    try:
        token = request.cookies.get("token")

        if token:
            check="""
            SELECT 
            attractions.id, attractions.name, attractions.address, 
            attractions.images, orders.price, orders.date, orders.time, orders.number, orders.contactName, orders.contactEmail, orders.contactPhone FROM attractions INNER JOIN orders ON attractions.id = orders.attractionId WHERE number = %s"""

            check_value=(orderNumber,)
            cursor.execute(check, check_value)
            records = cursor.fetchone()

            if records:
                jpg = re.split(",", records["images"])
                data = {
                    "number": records["number"],
                    "price": records["price"],
                    "trip":{
                        "attraction":{
                            "id": records["id"],
                            "name": records["name"],
                            "address": records["address"],
                            "image": jpg[0]
                        },
                        "date": records["date"],
                        "time": records["time"]
                    },
                    "contact":{
                        "name": records["contactName"],
                        "email": records["contactEmail"],
                        "phone": records["contactPhone"]
                    },
                    "status": 0
                }

            else:
                data = None

            res = make_response({"data": data}, 200)
            return res

        else:
            res = make_response(({
				"error": True,
				"message": "未登入系統，拒絕存取"}), 403)
            return res


    except Exception as e:
        # print(e)
        res = make_response(({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)
        return res