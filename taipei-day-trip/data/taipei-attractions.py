import re, json

import mysql.connector
mysql_connection = mysql.connector.connect(
    host='localhost',
    port='3306',
    user='root',
    password='dumplings67',
    database='attractions_data'
)
cursor = mysql_connection.cursor(buffered=True)


with open("taipei-attractions.json", mode="r",encoding="utf-8")as file:
    data = json.load(file)

datas = data["result"]["results"] # data就是全部的景點
# print(datas)



for information in datas: # information就是一個一個景點 
    saveDatas = []
    imagesUrl = re.split("https",information["file"])
    # 用https做分割，為的是用共同點把每一筆資料分開
    
    for i in imagesUrl:
        image = "https" + i + "," # 再把https加回去
        if "jpg" in image or "JPG" in image or "png" in image or "PNG" in image:
            
            saveDatas.append(image)

    name = information["name"]
    category = information["CAT"]
    description = information["description"]
    address = information["address"]
    transport = information["direction"]
    mrt = information["MRT"]
    lat = information["latitude"]
    lng = information["longitude"]
    images = ''.join(saveDatas) # ''.join(列表) 把[]轉()的語法


    
    insertCommand = "INSERT INTO attractions (name, category, description, address, transport, mrt, lat, lng, images) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)"

    insert = (name, category, description, address, transport, mrt, lat, lng, images)
    cursor.execute(insertCommand, insert)
    mysql_connection.commit()
        
