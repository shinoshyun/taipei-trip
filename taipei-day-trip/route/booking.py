from flask import Flask, Blueprint, jsonify, make_response, request
import re, jwt

booking = Blueprint('booking', __name__)
import mysql.connector
mysql_connection = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password='password',
    database='attractions_data'
)

cursor = mysql_connection.cursor(buffered=True)



@booking.route("/api/booking", methods=["POST"])
def bookingPost():
    try:
        token = request.cookies.get("token")
        
        if token:
            data = jwt.decode(token, "mykey123", algorithms=["HS256"])
            userId = data["id"]
            req = request.get_json()
            attractionId = req["attractionId"]
            date = req["date"]
            time = req["time"]
            price = req["price"]

            if date and time:
                checkBooking = "SELECT * FROM booking WHERE userId = %s"
                checkData = (userId,)
                cursor.execute(checkBooking, checkData)
                records = cursor.fetchall()

                if records:
                    deleteBooking = "DELETE FROM booking WHERE userId = %s"
                    deleteData = (userId,)
                    cursor.execute(deleteBooking, deleteData)
                    mysql_connection.commit()
            
                insertCommand = "INSERT INTO booking (userId, attractionId, date, time, price) VALUES(%s, %s, %s, %s, %s)"
                insert = (userId, attractionId, date, time, price)
                cursor.execute(insertCommand, insert)
                mysql_connection.commit()
                res = make_response(({"ok": True}), 200)
                return res

            else:
                res = make_response(({
			    "error": True,
			    "message": "建立失敗，輸入不正確或其他原因"}), 400)
                return res    

        else:
            res = make_response(({
				"error": True,
				"message": "未登入系統，拒絕存取"}), 403)
            return res


    except:
            res = make_response(({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)
            return res



@booking.route("/api/booking", methods=["GET"])
def bookingGet():
    token = request.cookies.get("token")
    data = jwt.decode(token, "mykey123", algorithms=["HS256"])
    userId = data["id"]

    if token:
        check = """
        SELECT 
            attractions.id, attractions.name, 
            attractions.address, attractions.images, 
            booking.date, booking.time, booking.price 
        FROM attractions INNER JOIN 
        booking ON attractions.id = booking.attractionId WHERE booking.userId = %s"""

        check_value = (userId, )
        cursor.execute(check, check_value)
        records = cursor.fetchone()
    
        if records:
            jpg = records[3].split(",")
            data = {
            "attraction" : {
        	    "id": records[0],
        	    "name": records[1],
        	    "address": records[2],
        	    "image": jpg[0]
        },
        	"date": records[4],
        	"time": records[5],
        	"price": records[6]
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

    

@booking.route("/api/booking", methods=["DELETE"])
def bookingDelete():
    
    token = request.cookies.get("token")
    
    if token:
        data = jwt.decode(token, "mykey123", algorithms=["HS256"])
        userId = data["id"]
        deleteBooking = "DELETE FROM booking WHERE userId = %s"
        deleteData = (userId,)
        cursor.execute(deleteBooking, deleteData)
        mysql_connection.commit()   
        res = make_response(({"ok": True}), 200)
        return res
        
    else:
        res = make_response(({
			"error": True,
			"message": "未登入系統，拒絕存取"}), 403)
        return res