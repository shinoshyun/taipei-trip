from flask import Flask, request, render_template, redirect, session, jsonify, make_response
import re, json


app=Flask(__name__, static_folder="static",
            static_url_path="/")
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False

import mysql.connector
mysql_connection = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password='password',
    database='attractions_data'
)
cursor = mysql_connection.cursor(buffered=True)




# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")








@app.route("/api/attractions", methods=["GET"])
def attractions():
	
	page = request.args.get("page", 0)
	page = int(page)
	keyword = request.args.get("keyword", "")

	# 搜尋全部資料
	saveDatas=[]
	check = "SELECT * FROM attractions WHERE category=%s OR name LIKE %s ORDER BY id LIMIT 12 OFFSET %s"
	check_value = (keyword, "%" + keyword + "%", page*12)
	cursor.execute(check, check_value)
	records = cursor.fetchall()	
	
	# 搜尋比對出的資料庫比數
	checkCount="SELECT COUNT(*) FROM attractions WHERE category=%s OR name LIKE %s ORDER BY id LIMIT 12 OFFSET %s"
	checkCount_value = (keyword, "%" + keyword + "%", page*12)
	cursor.execute(checkCount, checkCount_value)
	realSum = 0
	sum = cursor.fetchall()
	for i in sum:
		realSum=i[0]
		
	try:		
		for onePlace in records:
			jpg = re.split(",", onePlace[9])			
			data = {
        			"id": onePlace[0],
        			"name": onePlace[1],
        			"category": onePlace[2],
        			"description": onePlace[3],
        			"address": onePlace[4],
        			"transport": onePlace[5],
        			"mrt": onePlace[6],
        			"lat": onePlace[7],
        			"lng": onePlace[8],
        			"images": jpg[:-1]
        		}			
			saveDatas.append(data)

		if page < realSum/12-1 :
			return jsonify({"nextPage": page+1,"data": saveDatas})
		else:
			return jsonify({"nextPage": None,"data": saveDatas})

	except Exception:
		data={
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(data), 500

	



@app.route("/api/attraction/<attractionId>", methods=["GET"])
def attractionId(attractionId):
	
	check = "SELECT * FROM attractions WHERE id=%s"
	check_value=(attractionId,)
	cursor.execute(check, check_value)

	records = cursor.fetchone()
	
	
	try:
		jpg = re.split(",", records[9])
		data = {
        	"id": records[0],
        	"name": records[1],
        	"category": records[2],
        	"description": records[3],
        	"address": records[4],
        	"transport": records[5],
        	"mrt": records[6],
        	"lat": records[7],
        	"lng": records[8],
        	"images": jpg[:-1]
        	}
		return jsonify({"data": data}), 200


	except Exception:
		data={
			"error": True,
			"message": "景點編號不正確"
		}
		return jsonify(data), 400


	except:
		data={
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(data), 500

	
	
@app.route("/api/categories", methods=["GET"])
def categories():

	saveDatas=[]
	try:
		cursor.execute("SELECT DISTINCT category FROM attractions")

		records = cursor.fetchall()
		for i in records:
			saveDatas.append(i[0])
		return jsonify({"data": saveDatas}), 200

	except:
		data={
			"error": True,
			"message": "伺服器內部錯誤"
		}
	return jsonify(data), 500



app.run(host="0.0.0.0", port=3000)