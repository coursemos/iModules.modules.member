<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원 구조체를 정의한다.
 *
 * @file /modules/member/dtos/Member.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 24.
 */
namespace modules\member\dtos;
class Member
{
    /**
     * @var int $_id 회원고유값
     */
    private int $_id;

    /**
     * @var string $_email 이메일
     */
    private string $_email;

    /**
     * @var ?string $_code 회원추가코드
     */
    private ?string $_code = null;

    /**
     * @var string $_name 이름
     */
    private string $_name;

    /**
     * @var string $_nickname 닉네임
     */
    private string $_nickname;

    /**
     * @var string $_status 상태
     */
    private string $_status;

    /**
     * @var ?object $_extras 추가정보
     */
    private ?object $_extras = null;

    /**
     * 회원정보
     *
     * @var ?object $_member
     */
    private ?object $_member = null;

    /**
     * 회원 구조체를 정의한다.
     *
     * @param object $member 회원정보
     */
    public function __construct(?object $member = null)
    {
        /**
         * 비회원인 경우
         */
        if ($member === null) {
            $this->_id = 0;
            $this->_email = '';
            $this->_name = 'Unknown';
            $this->_nickname = 'Unknown';
            $this->_status = 'DEACTIVATED';
        } else {
            $this->_member = $member;
            $this->_id = intval($member->member_id);
            $this->_email = $member->email;
            $this->_name = $member->name;
            $this->_nickname = $member->nickname;
            $this->_status = $member->status;
            $this->_extras = json_decode($member->extras ?? 'null');
        }
    }

    /**
     * 고유값을 가져온다.
     *
     * @return int $id
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * 이메일주소를 가져온다.
     *
     * @return string $email
     */
    public function getEmail(): string
    {
        return $this->_email;
    }

    /**
     * 실명을 가져온다.
     *
     * @return string $name
     */
    public function getName(): string
    {
        return $this->_name;
    }

    /**
     * 닉네임을 가져온다.
     *
     * @return string $nickname
     */
    public function getNickname(): string
    {
        return $this->_nickname;
    }

    /**
     * 사이트설정에 따라 표시될 회원이름을 가져온다.
     *
     * @param bool $is_nickcon 닉이미지가 존재할 경우 닉이미지를 가져올지 여부 (기본값 true)
     * @return string $display_name
     */
    public function getDisplayName(bool $is_nickcon = true): string
    {
        return $this->_name;
    }

    /**
     * 회원사진 URL을 가져온다.
     *
     * @return string $url
     */
    public function getPhotoUrl(): string
    {
        return \Configs::dir() . '/members/' . $this->_id . '/photo.jpg';
    }

    /**
     * 회원사진을 가져온다.
     *
     * @param bool $is_html_tag HTML 태그로 가져올지 여부 (false 인 경우 사진 URL 만 가져온다.)
     * @return string $_photo
     */
    public function getPhoto(bool $is_html_tag = true): string
    {
        if (isset($this->_photo) == false) {
            $this->_photo = 'abcd.jpg';
        }

        if ($is_html_tag == true) {
            return \Html::element(
                'i',
                [
                    'data-module' => 'member',
                    'data-role' => 'photo',
                    'style' => 'background-image(' . $this->_photo . ')',
                ],
                $this->getDisplayName(false)
            );
        }

        return $this->_photo;
    }

    /**
     * 현재 사용자가 회원인지 확인한다.
     *
     * @return bool $is_member
     */
    public function isMember(): bool
    {
        return $this->_id !== 0;
    }
}
