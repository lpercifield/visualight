void replaceAll(char *buf_,const char *find_,const char *replace_)
{
  char *pos;
  int replen,findlen;

  findlen=strlen(find_);
  replen=strlen(replace_);

  while((pos=strstr(buf_,find_)))
  {
    strncpy(pos,replace_,replen);
    strcpy(pos+replen,pos+findlen);
  }
}
