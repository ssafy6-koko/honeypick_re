def read_secret(file_name):
    with open(file_name, 'r') as f:
        return {l.split('=')[0]: l.split('=')[1].rstrip() for l in f.readlines()}
