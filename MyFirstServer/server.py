from flask import Flask, request, render_template
from werkzeug.utils import redirect

app = Flask('alpha')

chat_list = { 'main chat': list() }
current_chat = ''

@app.route('/', methods=['GET'])
def get_main_page():
    return render_template('index.html', chat_list=chat_list, current_chat=current_chat)

@app.route('/get_messages', methods=['GET'])
def get_messages():
    global current_chat
    current_chat = request.args.get('chat_name')
    return redirect('/')

@app.route('/send_message', methods=['POST'])
def send_message():
    chat_list.get(current_chat).append(('You', request.data.decode('utf-8')))
    print('Recived message:', request.data.decode('utf-8'))
    return chat_list.get(current_chat)

@app.route('/search_chat', methods=['POST'])
def search_chat():
    chat = request.form.get('chat_name')
    return redirect('/')

app.run(debug=True, port=5000)