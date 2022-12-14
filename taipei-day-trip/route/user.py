from flask import Blueprint, request, make_response, request
from dotenv import load_dotenv
import jwt, os
import datetime

load_dotenv()

user = Blueprint('user', __name__)
import mysql.connector
import mysql.connector.pooling

pool = mysql.connector.pooling.MySQLConnectionPool(
    host='127.0.0.1',
    # port='3306',
    user='root',
    password=os.getenv("password"),
    database='attractions_data',
    pool_name='my_pool',
    pool_size=5,
	pool_reset_session=True
    
)

@user.route("/api/user", methods=["POST"])
def post():
	try:
		mysql_connection = pool.get_connection()
		cursor = mysql_connection.cursor(buffered=True, dictionary=True)
		
		req = request.get_json()
		name = req["name"]
		email = req["email"]
		password = req["password"]
		check="SELECT * FROM membership WHERE email = %s"
		check_val=(email,) 
		cursor.execute(check, check_val)
		records = cursor.fetchall()
		
		if not records and name and email and password:
			insertCommand = "INSERT INTO membership (name, email, password) VALUES(%s, %s, %s)"
			insert = (name, email, password)
			cursor.execute(insertCommand, insert)
			mysql_connection.commit()
			res = make_response(({"ok": True}), 200)
			return res
		
		else:	
			res = make_response(({
				"error": True,
				"message": "註冊失敗，Email已被註冊過囉"}), 400)
			return res
			
	except:
			res = make_response(({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)
			return res

	finally:
		cursor.close()
		mysql_connection.close()



@user.route("/api/user/auth", methods=["GET"])
def getcookie():

	token = request.cookies.get("token")

	if token is not None:
		data = jwt.decode(token, "mykey123", algorithms=["HS256"])
		
	else:
		data = None
		
	res = make_response(({"data": data}), 200)
	return res

	
	

@user.route("/api/user/auth", methods=["PUT"])
def put():
	try:
		mysql_connection = pool.get_connection()
		cursor = mysql_connection.cursor(buffered=True, dictionary=True)

		req = request.get_json()
		email = req["email"]
		password = req["password"]

		check = "SELECT * FROM membership WHERE email = %s and password = %s"
		check_val = (email, password)
		cursor.execute(check, check_val)
		records = cursor.fetchone()
		print(records)

		if (email == records["email"]) and (password== records["password"]):
			
			token = jwt.encode({
				"id": records["id"],
				"name": records["name"],
            	"email": records["email"]}, "mykey123", algorithm="HS256")
			
			res = make_response(({"ok": True}), 200)	
			expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=7)
			res.set_cookie(key="token", value=token, expires=expiration_time)
		
		else:
			res = make_response(({
				"error": True,
				"message": "登入失敗，帳號或密碼錯誤"}), 400)
		return res
	
	except:
		res = make_response(({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)
		return res

	finally:
		cursor.close()
		mysql_connection.close()


@user.route("/api/user/auth", methods=["DELETE"])
def delete():
	
	res = make_response(({"ok": True}), 200)
	res.set_cookie(key='token', value='', expires=0)

	return res


