from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, MessageSerializer,CreateMessageSerializer
from .models import Room, Message
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetMessages(APIView):
    serializer_class = MessageSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):

        code = request.GET.get(self.lookup_url_kwarg)
        if code is not None:
            try:
                room = Room.objects.get(code=code)
            except Room.DoesNotExist:
                return Response({'Error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            messages = Message.objects.filter(code=room)
            if messages.exists():
                serializer = MessageSerializer(messages, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                dataX = {'room': room.id, 'sender': 'system_user.id', 'content': 'Welcome to the chat'}
                serializer = CreateMessageSerializer(data=dataX)
                if serializer.is_valid():
                    message = serializer.save(code=room, sender="System")
                    msg = Message.objects.filter(code=room)
                    response_serializer = MessageSerializer(msg, many=True).data
                    return Response(response_serializer, status=status.HTTP_201_CREATED)
                else:
                    return Response({'Error': 'Invalid data for message creation.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'Bad Request': 'Code parameter not found in the request'}, status=status.HTTP_400_BAD_REQUEST)


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                Message.objects.filter(code=room.code).delete()
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause,
                            votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
                Message.objects.filter(code=room.code).delete()
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)
    
class PostMessage(APIView):
    serializer_class = CreateMessageSerializer

    def post(self, request, format=None):

        code = request.data.get('code')
        sender = request.data.get('sender', 'User')  # Set a default sender if not provided
        content = request.data.get('content')
        print(code)
        print(sender)
        print(content)
        if code is not None and content is not None:
            
            try:
                room = Room.objects.get(code=code)
            except Room.DoesNotExist:
                return Response({'Error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            data = {'code': code, 'sender': sender, 'content': content}
            serializer = CreateMessageSerializer(data=data)
            print("eeeeeee")
            if serializer.is_valid():
                print("validOOOOOOO")
                message = serializer.save(code=room)
                return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
            else:
                return Response({'Error': 'Invalid data for message creation.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'Bad Request': 'Code or content parameter not found in the request'}, status=status.HTTP_400_BAD_REQUEST)