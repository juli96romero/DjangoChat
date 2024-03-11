from django.shortcuts import render
from django.contrib.auth import login
from django.shortcuts import render, redirect

from django.contrib.auth import login
from django.shortcuts import render, redirect



def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')