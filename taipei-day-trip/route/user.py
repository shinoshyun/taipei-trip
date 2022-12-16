from flask import Blueprint, request, jsonify, make_response, request
import jwt
import datetime

user = Blueprint('user', __name__)
import mysql.connector
mysql_connection = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password='password',
    database='attractions_data'
)

cursor = mysql_connection.cursor(buffered=True)


@user.route("/api/user", methods=["POST"])
def post():
	req = request.get_json()
	name = req["name"]
	email = req["email"]
	password = req["password"]

	try:
		check="SELECT * FROM membership WHERE email = %s"
		check_val=(email,) 
		cursor.execute(check, check_val)
		records = cursor.fetchall()
		
		if not records and name and email and password:
			insertCommand = "INSERT INTO membership (name, email, password) VALUES(%s, %s, %s)"
			insert = (name, email, password)
			cursor.execute(insertCommand, insert)
			mysql_connection.commit()
			res = make_response(jsonify({"ok": True}), 200)
			
		
		else:	
			res = make_response(jsonify({
				"error": True,
				"message": "註冊失敗，Email已被註冊過囉"}), 400)
			
			
	except:
			res = make_response(jsonify({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)
	return res



@user.route("/api/user/auth", methods=["GET"])
def getcookie():

	token = request.cookies.get("token")

	if token is not None:
		data = jwt.decode(token, "mykey123", algorithms=["HS256"])
		# data = json.dumps(data)
		
	else:
		data = None
		
	res = make_response(({"data": data}), 200)
	return res
	

@user.route("/api/user/auth", methods=["PUT"])
def put():
	
	req = request.get_json()
	email = req["email"]
	password = req["password"]


	try:
		check = "SELECT * FROM membership WHERE email = %s and password = %s"
		check_val = (email, password)
		cursor.execute(check, check_val)
		records = cursor.fetchone()

		if (email == records[2]) and (password== records[3]):
			
			token = jwt.encode({
				"id": records[0],
				"name": records[1],
            	"email": records[2]}, "mykey123", algorithm="HS256")
			
			res = make_response(jsonify({"ok": True}), 200)	
			expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=7)
			res.set_cookie(key="token", value=token, expires=expiration_time)
		
		else:
			res = make_response(({
				"error": True,
				"message": "登入失敗，帳號或密碼錯誤"}), 400)
	
	except:
		res = make_response(({
			"error": True,
			"message": "伺服器內部錯誤"}), 500)

	return res


@user.route("/api/user/auth", methods=["DELETE"])
def delete():
	
	res = make_response(jsonify({"ok": True}), 200)
	res.set_cookie(key='token', value='', expires=0)

	return res